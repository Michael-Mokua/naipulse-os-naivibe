import {
  fetchWeatherProduction,
  fetchHeadlinesProduction,
  fetchBreakingNewsProduction,
} from './productionDataFetchers.js';

export const ROUTES = [
  { num: '46', name: 'CBD — Westlands', status: 'moving', color: '#EF9F27', textColor: '#633806' },
  { num: '11', name: 'CBD — Eastleigh', status: 'jam', color: '#E24B4A', textColor: '#fff' },
  { num: '23', name: 'CBD — Kawangware', status: 'moving', color: '#1D9E75', textColor: '#04342C' },
  { num: '58', name: 'CBD — Githurai', status: 'jam', color: '#D85A30', textColor: '#fff' },
  { num: '34', name: 'CBD — Langata', status: 'moving', color: '#7F77DD', textColor: '#fff' },
  { num: '19', name: 'CBD — Kasarani', status: 'slow', color: '#639922', textColor: '#fff' },
];

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

export const MOOD_CONFIGS = {
  happy: { emoji: '😊', label: 'HAPPY', color: '#FFD600', blob1: '#FFD600', blob2: '#00FF88', energy: 65 },
  chill: { emoji: '😌', label: 'CHILL', color: '#00D4FF', blob1: '#00D4FF', blob2: '#7B2FFF', energy: 35 },
  hype: { emoji: '🔥', label: 'HYPE', color: '#FF2D78', blob1: '#FF2D78', blob2: '#FFD600', energy: 90 },
  sad: { emoji: '😔', label: 'MELANCHOLY', color: '#7B2FFF', blob1: '#7B2FFF', blob2: '#444444', energy: 20 },
  angry: { emoji: '😤', label: 'RAW', color: '#FF4444', blob1: '#FF4444', blob2: '#FFD600', energy: 75 },
};

export const PLAYLIST_DATA = {
  happy: [
    { name: 'Sukuma Wiki', artist: 'Bien', genre: 'Afropop' },
    { name: 'Extravaganza', artist: 'Sauti Sol ft. Bensoul', genre: 'Bongo' },
    { name: 'Nairobi', artist: 'Blinky Bill', genre: 'Alt Afro' },
  ],
  chill: [
    { name: 'Malaika', artist: 'Nyashinski', genre: 'R&B' },
    { name: 'Nakupenda', artist: 'Sauti Sol', genre: 'Soul' },
    { name: 'Levitating', artist: 'Karun', genre: 'Alt R&B' },
  ],
  hype: [
    { name: 'Ferrari', artist: 'Ethic Entertainment', genre: 'Gengetone' },
    { name: 'Kelele', artist: 'Matata ft. Bensoul', genre: 'Afrohouse' },
    { name: 'Pombe Sigara', artist: 'Mejja', genre: 'Genge' },
  ],
  sad: [
    { name: 'Nimefika', artist: 'Nyashinski', genre: 'Rap Soul' },
    { name: 'Uliza Kiatu', artist: 'Octopizzo', genre: 'Hip Hop' },
    { name: 'Nishike', artist: 'Sauti Sol', genre: 'Ballad' },
  ],
  angry: [
    { name: 'Wajinga Nyinyi', artist: 'King Kaka', genre: 'Protest Rap' },
    { name: 'Tujiangalie', artist: 'Sauti Sol', genre: 'Social' },
    { name: 'Dundaing', artist: 'Ethic Entertainment', genre: 'Gengetone' },
  ],
};

export const VIBE_PRESETS = [
  { label: 'Friday night Westlands' },
  { label: 'CBD rush hour chaos' },
  { label: 'Quiet Karen morning' },
  { label: 'Gengetone on repeat' },
  { label: 'June 25 energy' },
];

export const NAIROBI_VIBE_TAGS = {
  happy: 'Chill na mandazi · Route 46 vibes',
  chill: 'Kawangware sunset mode',
  hype: 'Nganya bass max · Thika Road',
  sad: 'Nairobi rain on tin roofs',
  angry: 'Maandamano heartbeat',
};

const MOOD_KEYWORDS = {
  hype: ['hype', 'party', 'club', 'lit', 'fire', 'chaos', 'rush', 'gengetone', 'maandamano'],
  chill: ['chill', 'calm', 'relax', 'quiet', 'peace', 'slow', 'malaika'],
  sad: ['sad', 'tired', 'lonely', 'rain', 'miss', 'blue', 'melancholy'],
  angry: ['angry', 'mad', 'protest', 'fight', 'raw', 'pissed', 'wajinga'],
  happy: ['happy', 'good', 'sun', 'friday', 'love', 'vibe', 'poa'],
};

export function detectMoodFromText(text) {
  const lower = text.toLowerCase();
  let best = 'happy';
  let bestScore = 0;

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    const score = keywords.reduce((total, word) => (lower.includes(word) ? total + 1 : total), 0);
    if (score > bestScore) {
      bestScore = score;
      best = mood;
    }
  }

  return best;
}

const TRUTH_PATTERNS = [
  { match: /plastic bag|ban.*plastic/i, verdict: 'MISLEADING', confidence: 72, summary: 'Kenya banned single-use plastic bags in 2017, but not all plastics.', context: 'The 2017 ban targeted carrier bags — other plastic products remain regulated separately.' },
  { match: /nairobi.*safest|safest.*africa/i, verdict: 'UNVERIFIED', confidence: 41, summary: 'City safety rankings vary widely by methodology and year.', context: 'Nairobi has mixed indicators — always cross-check with local reporting.' },
  { match: /matatu.*free|free.*matatu/i, verdict: 'FALSE', confidence: 88, summary: 'No credible policy makes matatu rides free citywide in Nairobi.', context: 'Fare changes happen route-by-route; free transport claims are often misinformation.' },
];

export function generateSimulatedTruth(claim) {
  const hit = TRUTH_PATTERNS.find((pattern) => pattern.match.test(claim));
  const verdict = hit?.verdict || 'UNVERIFIED';
  const confidence = hit?.confidence || 55;
  const summary = hit?.summary || 'This claim needs more local sources before a firm Nairobi-specific verdict.';
  const context = hit?.context || 'NaiPulse TRUTH engine simulated this check — connect live APIs for production fact-checking.';

  return {
    verdict,
    confidence,
    summary,
    context,
    sources: [
      { stance: 'neutral', title: 'Nation Africa — Kenya News Desk', url: 'https://nation.africa' },
      { stance: 'supporting', title: 'Standard Media Fact Check', url: 'https://www.standardmedia.co.ke' },
      { stance: 'neutral', title: 'Africa Check', url: 'https://africacheck.org' },
    ],
  };
}

export async function fetchWeatherData() {
  const weather = await fetchWeatherProduction();
  if (!weather) return null;
  return {
    ...weather,
    feels: weather.feels ?? weather.temp,
  };
}

export async function fetchHeadlineItems() {
  return fetchHeadlinesProduction();
}

export async function fetchBreakingItems() {
  return fetchBreakingNewsProduction();
}
