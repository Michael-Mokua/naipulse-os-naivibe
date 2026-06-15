// Web Scraping Service for Naipulse OS
// Responsible for real-time data aggregation from various sources
// Browser-compatible version using fetch API with real API integrations

class WebScraperService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    this.rateLimiter = new Map();
  }

  // Rate limiting helper
  async checkRateLimit(domain, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const requests = this.rateLimiter.get(domain) || [];
    
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      const waitTime = windowMs - (now - recentRequests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    recentRequests.push(now);
    this.rateLimiter.set(domain, recentRequests);
  }

  // Cache helper
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Generic scraper with error handling and caching
  async scrapeUrl(url, options = {}) {
    const cacheKey = `scrape_${url}`;
    const cached = this.getFromCache(cacheKey);
    if (cached && !options.bypassCache) {
      return cached;
    }

    try {
      const domain = new URL(url).hostname;
      await this.checkRateLimit(domain);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const data = await response.text();
      
      const result = {
        url,
        data,
        timestamp: Date.now(),
        status: response.status
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Scraping error for ${url}:`, error.message);
      throw error;
    }
  }

  // News Scraping using NewsAPI
  async scrapeKenyanNews() {
    const apiKey = import.meta.env.NEWSAPI_KEY;
    if (!apiKey) {
      console.warn('NEWSAPI_KEY not found in environment variables');
      return [];
    }

    try {
      const response = await fetch(`https://newsapi.org/v2/everything?q=Kenya&apiKey=${apiKey}`);
      const data = await response.json();
      
      return data.articles.map(article => ({
        source: article.source.name,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        category: 'general'
      }));
    } catch (error) {
      console.error('Error scraping Kenyan news:', error);
      return [];
    }
  }

  // Traffic Scraping using real traffic APIs
  async scrapeTrafficUpdates() {
    // Integrate with Google Traffic API or local traffic services
    // This requires API keys and proper backend setup
    try {
      // Placeholder for real API integration
      // Example: Google Maps Traffic API, TomTom API, etc.
      return [];
    } catch (error) {
      console.error('Error scraping traffic updates:', error);
      return [];
    }
  }

  // Weather Scraping using OpenWeatherMap API
  async scrapeWeatherData() {
    const apiKey = import.meta.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.warn('OPENWEATHER_API_KEY not found in environment variables');
      return null;
    }

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Nairobi&appid=${apiKey}&units=metric`);
      const data = await response.json();
      
      return {
        source: 'OpenWeatherMap',
        temperature: `${Math.round(data.main.temp)}°C`,
        condition: data.weather[0].description,
        location: 'Nairobi',
        humidity: `${data.main.humidity}%`,
        wind: `${data.wind.speed} m/s`,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error scraping weather data:', error);
      return null;
    }
  }

  // Events Scraping using Eventbrite API
  async scrapeEvents() {
    const apiKey = import.meta.env.EVENTBRITE_API_KEY;
    if (!apiKey) {
      console.warn('EVENTBRITE_API_KEY not found in environment variables');
      return [];
    }

    try {
      const response = await fetch(`https://www.eventbriteapi.com/v3/events/search/?location.address=Nairobi&token=${apiKey}`);
      const data = await response.json();
      
      return data.events.map(event => ({
        source: 'Eventbrite',
        title: event.name.text,
        description: event.description?.text || '',
        date: event.start.local,
        location: event.venue?.address?.localized_address_display || 'TBD',
        eventType: 'general',
        url: event.url
      }));
    } catch (error) {
      console.error('Error scraping events:', error);
      return [];
    }
  }

  // Football Scores using API-Football or similar
  async scrapeFootballScores() {
    const apiKey = import.meta.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      console.warn('FOOTBALL_API_KEY not found in environment variables');
      return [];
    }

    try {
      // Placeholder for real football API integration
      // Example: API-Football, TheSportsDB, etc.
      return [];
    } catch (error) {
      console.error('Error scraping football scores:', error);
      return [];
    }
  }

  // Crime/Safety Data from official sources
  async scrapeSafetyData() {
    // Integrate with official crime reporting APIs or government sources
    // This requires proper API access and authentication
    try {
      // Placeholder for real safety data integration
      return [];
    } catch (error) {
      console.error('Error scraping safety data:', error);
      return [];
    }
  }

  // Public Alerts from official sources
  async scrapePublicAlerts() {
    // Integrate with embassy APIs, Red Cross, government alert systems
    try {
      // Placeholder for real alert integration
      return [];
    } catch (error) {
      console.error('Error scraping public alerts:', error);
      return [];
    }
  }

  // Market Prices from official sources
  async scrapeMarketPrices() {
    // Integrate with government agricultural price monitoring systems
    try {
      // Placeholder for real market price integration
      return [];
    } catch (error) {
      console.error('Error scraping market prices:', error);
      return [];
    }
  }

  // Aggregated Dashboard Data
  async getDashboardData() {
    const [news, traffic, weather, events, scores, safety, alerts, prices] = await Promise.allSettled([
      this.scrapeKenyanNews(),
      this.scrapeTrafficUpdates(),
      this.scrapeWeatherData(),
      this.scrapeEvents(),
      this.scrapeFootballScores(),
      this.scrapeSafetyData(),
      this.scrapePublicAlerts(),
      this.scrapeMarketPrices()
    ]);

    return {
      news: news.status === 'fulfilled' ? news.value : [],
      traffic: traffic.status === 'fulfilled' ? traffic.value : [],
      weather: weather.status === 'fulfilled' ? weather.value : null,
      events: events.status === 'fulfilled' ? events.value : [],
      scores: scores.status === 'fulfilled' ? scores.value : [],
      safety: safety.status === 'fulfilled' ? safety.value : [],
      alerts: alerts.status === 'fulfilled' ? alerts.value : [],
      prices: prices.status === 'fulfilled' ? prices.value : [],
      lastUpdated: Date.now()
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default new WebScraperService();
