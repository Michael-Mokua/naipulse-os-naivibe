import { groqFetch } from './sanityClient.js';
import logger from './logger.js';

const CACHE = {};
const CACHE_TTL = {
  weather: 600, // 10 min
  headlines: 1800, // 30 min
  stocks: 300, // 5 min
  matatu: 120, // 2 min
};

function getCacheKey(type, id = '') {
  return `${type}:${id}`;
}

function getFromCache(key) {
  const entry = CACHE[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl * 1000) {
    delete CACHE[key];
    return null;
  }
  return entry.data;
}

function setInCache(key, data, ttl) {
  CACHE[key] = { data, ttl, timestamp: Date.now() };
}

// ============ WEATHER ============
export async function fetchWeatherProduction() {
  const cacheKey = getCacheKey('weather');
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-1.286389&longitude=36.817223&current_weather=true&timezone=Africa%2FNairobi&hourly=temperature_2m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min'
    );
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    const data = await response.json();

    const weather = {
      temp: Math.round(data.current_weather.temperature),
      condition: getWeatherCondition(data.current_weather.weather_code),
      humidity: 65, // Open-Meteo doesn't include humidity; use AI/GROQ to estimate if needed
      wind: Math.round(data.current_weather.windspeed),
      aqi: 'Moderate',
      hourly: data.hourly,
      daily: data.daily,
      timestamp: new Date().toISOString(),
    };

    setInCache(cacheKey, weather, CACHE_TTL.weather);
    return weather;
  } catch (error) {
    console.error('Production weather fetch failed:', error);
    logger.error(`Production weather fetch failed: ${error.message || error}`);
    return null;
  }
}

function getWeatherCondition(code) {
  const map = {
    0: 'Clear sky', 1: 'Clear sky', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Slight snow',
    73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Rain showers',
    81: 'Heavy rain showers', 82: 'Violent rain', 85: 'Snow showers',
    86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm + hail',
    99: 'Violent thunderstorm',
  };
  return map[code] || 'Unknown';
}

// ============ NSE STOCKS ============
export async function fetchNSEStocksProduction() {
  const cacheKey = getCacheKey('stocks');
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const symbols = ['SCOM', 'EQTY', 'KCB', 'KPLC', 'COOP', 'ABSA'];
    const stocks = await Promise.all(symbols.map((sym) => fetchNSEStockBySymbol(sym)));
    const result = stocks.filter(Boolean);
    setInCache(cacheKey, result, CACHE_TTL.stocks);
    return result;
  } catch (error) {
    console.error('NSE fetch failed:', error);
    logger.error(`NSE fetch failed: ${error.message || error}`);
    return null;
  }
}

async function fetchNSEStockBySymbol(symbol) {
  try {
    const url = `https://api.allorigins.win/raw?url=https://www.nse.or.ke/live-trading/?symbol=${symbol}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const html = await response.text();

    const parsed = await groqFetch(
      `Parse this HTML and extract stock price, change, and up/down status for ${symbol}: "${html.slice(0, 2000)}"`
    );

    return parsed;
  } catch (error) {
    console.warn(`Failed to fetch ${symbol}:`, error);
    logger.warn(`Failed to fetch ${symbol}: ${error.message || error}`);
    return null;
  }
}

// ============ HEADLINES & BREAKING NEWS ============
export async function fetchHeadlinesProduction() {
  const cacheKey = getCacheKey('headlines');
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  // Try NewsAPI (client-side via import.meta.env) first
  if (import.meta.env.VITE_NEWSAPI_KEY) {
    try {
      const news = await fetchHeadlinesFromNewsAPI();
      if (Array.isArray(news) && news.length > 0) {
        setInCache(cacheKey, news, CACHE_TTL.headlines);
        return news;
      }
    } catch (err) {
      console.warn('NewsAPI fetch failed:', err);
      logger.warn(`NewsAPI fetch failed: ${err.message || err}`);
    }
  }

  // Fall back to scraping + GROQ parsing
  return fetchHeadlinesFromNewsScrape();
}

async function fetchHeadlinesFromNewsAPI() {
  const key = import.meta.env.VITE_NEWSAPI_KEY;
  if (!key) throw new Error('VITE_NEWSAPI_KEY not configured');

  const url = `https://newsapi.org/v2/top-headlines?country=ke&pageSize=10&apiKey=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
  const data = await res.json();

  if (!data.articles || !Array.isArray(data.articles)) return [];

  return data.articles.map((a) => ({
    title: a.title || a.description || 'Untitled',
    tag: a.topic || a.category || null,
    source: (a.source && a.source.name) || 'NewsAPI',
    link: a.url,
    timestamp: a.publishedAt || new Date().toISOString(),
  }));
}

async function fetchHeadlinesFromNewsScrape() {
  try {
    const sources = [
      { name: 'Standard Media', url: 'https://www.standardmedia.co.ke' },
      { name: 'Nation Africa', url: 'https://nation.africa' },
      { name: 'The Star', url: 'https://www.the-star.co.ke' },
    ];

    const headlines = [];
    for (const source of sources) {
      try {
        const html = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(source.url)}`).then((r) => (r.ok ? r.text() : null));
        if (!html) continue;

        try {
          const extracted = await groqFetch(
            `Extract the top 3 news headlines from this HTML (from ${source.name}). Return as JSON array with title, tag, and link. HTML: "${html.slice(0, 3000)}"`
          );

          if (Array.isArray(extracted)) {
            headlines.push(...extracted.map((h) => ({ ...h, source: source.name, timestamp: new Date().toISOString() })));
            continue;
          }
        } catch (e) {
          logger.warn(`GROQ extraction failed for ${source.name}: ${e.message || e}`);
          // fallback: simple regex extraction
          const matches = html.match(/<a[^>]+>([^<]{20,200})<\/a>/gi) || [];
          for (const m of matches.slice(0, 3)) {
            const title = m.replace(/<[^>]+>/g, '').trim();
            headlines.push({ title, tag: null, link: source.url, source: source.name, timestamp: new Date().toISOString() });
          }
        }
      } catch (err) {
        console.warn(`Failed to scrape ${source.name}:`, err);
        logger.warn(`Failed to scrape ${source.name}: ${err.message || err}`);
      }
    }

    setInCache(getCacheKey('headlines'), headlines, CACHE_TTL.headlines);
    return headlines.slice(0, 10);
  } catch (error) {
    console.error('News scraping failed:', error);
    logger.error(`News scraping failed: ${error.message || error}`);
    return [];
  }
}

export async function fetchBreakingNewsProduction() {
  const cacheKey = getCacheKey('breaking');
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  // Try NewsAPI for breaking-style headlines
  if (import.meta.env.VITE_NEWSAPI_KEY) {
    try {
      const res = await fetch(`https://newsapi.org/v2/top-headlines?country=ke&pageSize=10&apiKey=${encodeURIComponent(import.meta.env.VITE_NEWSAPI_KEY)}`);
      if (res.ok) {
        const body = await res.json();
        const breaking = (body.articles || []).filter(a => /breaking|alert/i.test(a.title || a.description || '')).map(a => `🚨 ${a.title}`);
        if (breaking.length) {
          setInCache(cacheKey, breaking, 120);
          return breaking;
        }
      }
    } catch (err) {
      console.warn('NewsAPI breaking fetch failed:', err);
      logger.warn(`NewsAPI breaking fetch failed: ${err.message || err}`);
    }
  }

  // Fallback: scrape and look for alerts
  try {
    const sources = ['https://www.standardmedia.co.ke', 'https://nation.africa'];
    const out = [];
    for (const s of sources) {
      try {
        const html = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(s)}`).then(r => r.ok ? r.text() : null);
        if (!html) continue;
        try {
          const extracted = await groqFetch(`Extract breaking alerts from this HTML: "${html.slice(0, 3000)}"`);
          if (Array.isArray(extracted)) {
            out.push(...extracted.map(x => `🚨 ${x}`));
            continue;
          }
        } catch (e) {
          logger.warn(`GROQ breaking extraction failed for ${s}: ${e.message || e}`);
          const matches = html.match(/(Breaking[^<]{0,100}|🚨[^<]{0,200})/gi) || [];
          out.push(...matches.map(m => `🚨 ${m.replace(/<[^>]+>/g,'')}`));
        }
      } catch (err) {
        console.warn('Failed to fetch/scrape for breaking:', err);
        logger.warn(`Failed to fetch/scrape for breaking: ${err.message || err}`);
      }
    }
    setInCache(cacheKey, out, 120);
    return out;
  } catch (error) {
    console.warn('Breaking news scraping failed:', error);
    logger.warn(`Breaking news scraping failed: ${error.message || error}`);
    return [];
  }
}

// ============ MATATU STATUS & TRAFFIC ============
export async function fetchMatutuStatusProduction() {
  const cacheKey = getCacheKey('matatu');
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const query = `Search for current traffic status on these Nairobi matatu routes: CBD-Westlands, CBD-Eastleigh, CBD-Kawangware, CBD-Githurai, CBD-Langata, CBD-Kasarani. Return traffic as: \"jam\", \"slow\", or \"moving\".`;
    const result = await groqFetch(query);
    setInCache(cacheKey, result, CACHE_TTL.matatu);
    return result;
  } catch (error) {
    console.warn('Matatu status fetch failed:', error);
    logger.warn(`Matatu status fetch failed: ${error.message || error}`);
    return null;
  }
}

// ============ FOOTBALL SCORES ============
export async function fetchFootballScoresProduction() {
  const cacheKey = getCacheKey('football');
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://www.espn.com/soccer/standings/_/league/KPL');
    if (!response.ok) throw new Error('ESPN fetch failed');
    const html = await response.text();

    const scores = await groqFetch(
      `Extract top 3 live football matches from this ESPN HTML (KPL, EPL, UCL). Return as JSON with home, away, score, live, comp. HTML: "${html.slice(0, 2000)}"`
    );

    setInCache(cacheKey, scores, 300);
    return scores;
  } catch (error) {
    console.warn('Football scores fetch failed:', error);
    logger.warn(`Football scores fetch failed: ${error.message || error}`);
    return null;
  }
}

// ============ TRUTH VERIFICATION ============
export async function verifyClaimProduction(claim) {
  try {
    try {
      const groqQuery = `Fact-check this claim: "${claim}". Search for evidence. Return verdict (TRUE/FALSE/MISLEADING/UNVERIFIED), confidence (0-100), summary, and 2-3 sources with links.`;
      const verification = await groqFetch(groqQuery);
      if (verification) return verification;
    } catch (e) {
      console.warn('GROQ verification failed, falling back to web search:', e);
      logger.warn(`GROQ verification failed: ${e.message || e}`);
    }

    const searchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.google.com/search?q=' + encodeURIComponent(claim))}`;
    const html = await fetch(searchUrl).then(r => r.ok ? r.text() : null);
    if (!html) return { verdict: 'UNVERIFIED', confidence: 0, summary: 'No evidence found', sources: [] };

    const links = Array.from(html.matchAll(/<a href="\/url\?q=(https?:[^&\"]+)/g)).slice(0,3).map(m=>m[1]);
    return {
      verdict: 'UNVERIFIED',
      confidence: 40,
      summary: 'Automated search did not find high-confidence fact-checks. Review sources manually.',
      sources: links.map(u => ({ title: u, url: u, stance: 'unknown' }))
    };
  } catch (error) {
    console.error('Claim verification failed:', error);
    logger.error(`Claim verification failed: ${error.message || error}`);
    return null;
  }
}

// ============ MOOD/VIBE DETECTION (AI-powered) ============
export async function detectMoodWithAI(text) {
  try {
    const query = `Analyze this Nairobi street vibe and detect mood: "${text}". Return mood (happy/sad/hype/reflective/chaotic/chill/romantic/grind), energy level (0-100), and a Nairobi-specific vibe tag.`;
    const result = await groqFetch(query);
    return result;
  } catch (error) {
    console.warn('AI mood detection failed:', error);
    logger.warn(`AI mood detection failed: ${error.message || error}`);
    return null;
  }
}

// ============ CACHE MANAGEMENT ============
export function clearCache(type = null) {
  if (type) {
    Object.keys(CACHE).forEach((key) => {
      if (key.startsWith(type)) delete CACHE[key];
    });
  } else {
    Object.keys(CACHE).forEach((key) => delete CACHE[key]);
  }
}

export function getCacheStats() {
  return {
    entries: Object.keys(CACHE).length,
    keys: Object.keys(CACHE),
    memory: JSON.stringify(CACHE).length,
  };
}
