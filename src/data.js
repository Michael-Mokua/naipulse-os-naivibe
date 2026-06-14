import { fetchWeatherProduction, fetchHeadlinesProduction, fetchBreakingNewsProduction, fetchNSEStocksProduction } from './productionDataFetchers.js';

export const ROUTES = [
  { num: '46', name: 'CBD — Westlands', status: 'moving', color: '#EF9F27', textColor: '#633806' },
  { num: '11', name: 'CBD — Eastleigh', status: 'jam', color: '#E24B4A', textColor: '#fff' },
  { num: '23', name: 'CBD — Kawangware', status: 'moving', color: '#1D9E75', textColor: '#04342C' },
  { num: '58', name: 'CBD — Githurai', status: 'jam', color: '#D85A30', textColor: '#fff' },
  { num: '34', name: 'CBD — Langata', status: 'moving', color: '#7F77DD', textColor: '#fff' },
  { num: '19', name: 'CBD — Kasarani', status: 'slow', color: '#639922', textColor: '#fff' },
];

// Static UI assets and presets (kept local)
export const HERO_IMAGE_URL = '/assets/nganya_graffiti.jpg';
export const PAGE_BACKGROUND_URL = '/assets/48ef2514daed7ba00e646a8138348b83.jpg';
export const ALL_ASSETS = [
  '/assets/48ef2514daed7ba00e646a8138348b83.jpg',
  '/assets/5f5b99b4f93a1994ab4b7b8161db739b.jpg',
  '/assets/62af4b737d7b054c711d06bd2fd0fbf7.jpg',
  '/assets/80ec61228860937.Y3JvcCw4NTAsNjY0LDAsMTE1.png',
  '/assets/895b8adbe386874b2f646bb34b85a79c.jpg',
  '/assets/8a05d795d988cf0edf4d3e677f8e9879.jpg',
  '/assets/8c391e40df888a8c557d0415e437a2a5.jpg',
  '/assets/9aa243a1935c01cb4569055cf81ad13c.jpg',
  '/assets/b444ea33e5658b7c8c768212347c2feb.jpg',
  '/assets/baba_yaga.jpg',
  '/assets/d2a1d197300713.Y3JvcCwzOTc3LDMxMTAsNTcwLDEzNw.jpg',
  '/assets/graffiti_the_mall.jpg',
  '/assets/intoxicated.jpg',
  '/assets/Jomo_Kenyatta_Statue_and_KICC.jpg',
  '/assets/Kenya-culture-guide-Nairobi.jpg',
  '/assets/massai-tribesmen-kenya.jpg',
  '/assets/nairobi map.jpg',
  '/assets/nairobi scenic night view.png',
  '/assets/nairobi_nightlife.jpg',
  '/assets/nairobi_transport.jpg',
  '/assets/nganya_graffiti.jpg',
  '/assets/nRHFGQyNWSaN2teQEmRm5stRHZ3gknp311TXBh9u.png',
  '/assets/Uhuru_Monument.jpg',
];

export const HERO_ACCENT_IMAGES = [
  '/assets/80ec61228860937.Y3JvcCw4NTAsNjY0LDAsMTE1.png',
  '/assets/baba_yaga.jpg',
  '/assets/nairobi scenic night view.png',
  '/assets/8a05d795d988cf0edf4d3e677f8e9879.jpg',
  '/assets/Uhuru_Monument.jpg',
];

export const CREATOR_FEED = ALL_ASSETS.map((image, index) => ({
  image,
  caption: `Nairobi street frame ${index + 1}`,
  sub: 'City pulse archive',
  source: 'Local asset',
}));

export const VERDICT_CONFIG = {
  TRUE: { label: 'Verified True', color: '#0F6E56', bg: '#E1F5EE', icon: 'ti-circle-check' },
  FALSE: { label: 'False', color: '#993C1D', bg: '#FAECE7', icon: 'ti-circle-x' },
  MISLEADING: { label: 'Misleading', color: '#854F0B', bg: '#FAEEDA', icon: 'ti-alert-triangle' },
  UNVERIFIED: { label: 'Unverified', color: '#533AB7', bg: '#EEEDFE', icon: 'ti-help-circle' },
};

const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

export async function fetchWeatherData() {
-  try {
-    const response = await fetch(
-      'https://api.open-meteo.com/v1/forecast?latitude=-1.286389&longitude=36.817223&current_weather=true&timezone=Africa%2FNairobi'
-    );
-
-    if (!response.ok) {
-      throw new Error(`Open-Meteo error: ${response.status}`);
-    }
-
-    const payload = await response.json();
-    return {
-      temp: Math.round(payload.current_weather.temperature),
-      feels: Math.round(payload.current_weather.temperature),
-      condition: WEATHER_CODE_MAP[payload.current_weather.weathercode] || 'Partly cloudy',
-      humidity: WEATHER_DATA.humidity,
-      wind: Math.round(payload.current_weather.windspeed),
-      aqi: WEATHER_DATA.aqi,
-    };
-  } catch (error) {
-    console.warn('Weather fetch failed:', error);
-    return WEATHER_DATA;
-  }
+  // Use production fetcher (Open-Meteo) which includes caching and fallbacks
+  return fetchWeatherProduction();
 }

 export async function fetchHeadlineItems() {
-  if (!hasSanityConfig) {
-    return HEADLINES;
-  }
-
-  const query = '*[_type == "headline"] | order(publishedAt desc)[0...6]{title, tag}';
-
-  try {
-    const result = await groqFetch(query);
-    if (!Array.isArray(result) || result.length === 0) {
-      return HEADLINES;
-    }
-    return result.map((item) => ({ title: item.title || '', tag: item.tag || 'News' }));
-  } catch (error) {
-    console.warn('Sanity headline fetch failed:', error);
-    return HEADLINES;
-  }
+  return fetchHeadlinesProduction();
 }

 export async function fetchBreakingItems() {
-  if (!hasSanityConfig) {
-    return BREAKING;
-  }
-
-  const query = '*[_type == "breaking"] | order(publishedAt desc)[0...6].message';
-
-  try {
-    const result = await groqFetch(query);
-    if (!Array.isArray(result) || result.length === 0) {
-      return BREAKING;
-    }
-    return result.filter(Boolean);
-  } catch (error) {
-    console.warn('Sanity breaking fetch failed:', error);
-    return BREAKING;
-  }
+  return fetchBreakingNewsProduction();
 }
*** End Patch