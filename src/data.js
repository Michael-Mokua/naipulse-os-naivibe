export const ROUTES = [
  { num: '46', name: 'CBD — Westlands', status: 'moving', color: '#EF9F27', textColor: '#633806' },
  { num: '11', name: 'CBD — Eastleigh', status: 'jam', color: '#E24B4A', textColor: '#fff' },
  { num: '23', name: 'CBD — Kawangware', status: 'moving', color: '#1D9E75', textColor: '#04342C' },
  { num: '58', name: 'CBD — Githurai', status: 'jam', color: '#D85A30', textColor: '#fff' },
  { num: '34', name: 'CBD — Langata', status: 'moving', color: '#7F77DD', textColor: '#fff' },
  { num: '19', name: 'CBD — Kasarani', status: 'slow', color: '#639922', textColor: '#fff' },
];

export const NSE_STOCKS = [
  { sym: 'SCOM', price: '13.85', change: '+0.20', up: true },
  { sym: 'EQTY', price: '42.50', change: '+1.25', up: true },
  { sym: 'KCB', price: '27.30', change: '-0.45', up: false },
  { sym: 'KPLC', price: '2.10', change: '+0.05', up: true },
  { sym: 'COOP', price: '12.90', change: '-0.10', up: false },
  { sym: 'ABSA', price: '14.20', change: '+0.30', up: true },
];

export const WEATHER_DATA = {
  temp: 22,
  feels: 21,
  condition: 'Partly cloudy',
  humidity: 68,
  wind: 14,
  aqi: 'Good',
};

export const FOOTBALL = [
  { home: 'Gor Mahia', away: 'AFC Leopards', score: '2 - 1', live: true, comp: 'KPL' },
  { home: 'PSG', away: 'Man City', score: '3 - 2', live: false, comp: 'UCL' },
  { home: 'Arsenal', away: 'Chelsea', score: '1 - 1', live: false, comp: 'EPL' },
];

export const HEADLINES = [
  { title: 'Nairobi expressway reduces CBD congestion by 40% — KENHA report', tag: 'Transport' },
  { title: 'NSE 20-share index gains 1.2% on strong banking sector earnings', tag: 'Business' },
  { title: 'Rains expected to resume in Nairobi this weekend — KMD forecast', tag: 'Weather' },
  { title: 'Huawei opens new ICT talent centre at University of Nairobi', tag: 'Tech' },
];

export const BREAKING = [
  '🚨 BREAKING — Expressway toll reduced by 20% for motorcycles effective Monday',
  '🚍 Matatu SACCO announces new routes to Ruaka and Rosslyn',
  '📈 KES strengthens against USD — Central Bank of Kenya report',
  '⚡ KPLC announces 8-hour maintenance outage in Westlands this Thursday',
];

export const VERDICT_CONFIG = {
  TRUE: { label: 'Verified True', color: '#0F6E56', bg: '#E1F5EE', icon: 'ti-circle-check' },
  FALSE: { label: 'False', color: '#993C1D', bg: '#FAECE7', icon: 'ti-circle-x' },
  MISLEADING: { label: 'Misleading', color: '#854F0B', bg: '#FAEEDA', icon: 'ti-alert-triangle' },
  UNVERIFIED: { label: 'Unverified', color: '#533AB7', bg: '#EEEDFE', icon: 'ti-help-circle' },
};

const SIMULATED_TRUTH_DB = [
  {
    keywords: ['expressway', 'toll', 'kenha', 'nairobi expressway'],
    verdict: 'MISLEADING',
    confidence: 85,
    summary: 'KenHA announced a toll review, but the circulating claim of a flat 50% discount for all cars is inaccurate.',
    sources: [
      { title: 'KenHA Official Statement', url: 'https://www.kenha.co.ke', stance: 'supports' },
      { title: 'Citizen Digital News', url: 'https://www.citizen.digital', stance: 'supports' },
    ],
    context: 'Expressway tolls are managed under PPP contracts and adjusted by vehicle class.',
  },
  {
    keywords: ['plastic', 'ban', 'bags'],
    verdict: 'TRUE',
    confidence: 98,
    summary: 'Kenya enacted one of the world’s strictest single-use plastic bag bans in 2017.',
    sources: [
      { title: 'NEMA Kenya', url: 'https://www.nema.go.ke', stance: 'supports' },
    ],
    context: 'The ban remains enforced in Nairobi and across Kenya.',
  },
];

export function generateSimulatedTruth(claim) {
  const normalized = claim.toLowerCase();
  const match = SIMULATED_TRUTH_DB.find((item) => item.keywords.some((key) => normalized.includes(key)));

  if (match) {
    return match;
  }

  const verdicts = ['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIED'];
  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
  const confidence = 50 + Math.floor(Math.random() * 45);
  let summary = 'The claim was evaluated against local Nairobi intelligence samples.';

  if (verdict === 'TRUE') {
    summary = 'Evidence from trusted local sources supports this claim.';
  } else if (verdict === 'FALSE') {
    summary = 'Available evidence contradicts this claim in the current Nairobi context.';
  } else if (verdict === 'MISLEADING') {
    summary = 'The claim mixes accurate facts with misleading context.';
  } else {
    summary = 'There is insufficient public evidence to confirm or deny this claim.';
  }

  return {
    verdict,
    confidence,
    summary,
    sources: [
      { title: 'Nairobi City Portal', url: 'https://nairobi.go.ke', stance: 'neutral' },
      { title: 'Standard Media', url: 'https://www.standardmedia.co.ke', stance: 'supports' },
    ],
    context: 'Local NAI PULSE OS simulation review.',
  };
}

export const MOOD_CONFIGS = {
  happy: { emoji: '😄', color: '#FFD600', blob1: '#FFD600', blob2: '#FF8C00', energy: 65, label: 'HAPPY VIBES' },
  sad: { emoji: '💙', color: '#4A90D9', blob1: '#4A90D9', blob2: '#9B5EFF', energy: 20, label: 'BLUE FEELS' },
  hype: { emoji: '🔥', color: '#FF2D78', blob1: '#FF2D78', blob2: '#FF8C00', energy: 90, label: 'FULL HYPE MODE' },
  reflective: { emoji: '🌙', color: '#9B5EFF', blob1: '#4A1E9E', blob2: '#9B5EFF', energy: 35, label: 'DEEP REFLECTION' },
  chaotic: { emoji: '⚡', color: '#39FF14', blob1: '#39FF14', blob2: '#FF2D78', energy: 95, label: 'CHAOTIC ENERGY' },
  chill: { emoji: '🌊', color: '#1D9E75', blob1: '#1D9E75', blob2: '#4A90D9', energy: 30, label: 'FULL CHILL MODE' },
  romantic: { emoji: '❤️', color: '#FF2D78', blob1: '#FF2D78', blob2: '#9B5EFF', energy: 45, label: 'LOVE IN THE AIR' },
  grind: { emoji: '💪', color: '#FF8C00', blob1: '#FF8C00', blob2: '#FFD600', energy: 80, label: 'HUSTLE SEASON' },
};

export const VIBE_PRESETS = [
  { label: '🌆 Chill evening in Westlands', mood: 'chill' },
  { label: '🚍 Nganya morning rush', mood: 'chaotic' },
  { label: '💔 Heartbroken in Lavington', mood: 'sad' },
  { label: '🔥 Party in Umoja', mood: 'hype' },
  { label: '🌙 Late night CBD reflections', mood: 'reflective' },
  { label: '💪 Monday morning grind', mood: 'grind' },
  { label: '😍 Date night in Karen', mood: 'romantic' },
];

export const PLAYLIST_DATA = {
  happy: [
    { name: 'Extravaganza', artist: 'Burna Boy', genre: 'Afrobeats' },
    { name: 'Sugarcane', artist: 'Camidoh', genre: 'Afropop' },
    { name: 'Sawa Sawa', artist: 'Masauti', genre: 'Gengetone' },
  ],
  sad: [
    { name: 'Ikiwa', artist: 'Sauti Sol', genre: 'R&B' },
    { name: 'Midnight Train', artist: 'Bensoul', genre: 'Soul' },
    { name: 'Wewe', artist: 'Willy Paul', genre: 'Gospel Pop' },
  ],
  hype: [
    { name: 'Wamlambez', artist: 'Sailors Gang', genre: 'Gengetone' },
    { name: 'Di Ting', artist: 'Fena Gitu', genre: 'Afropop' },
    { name: 'Pombe Sigara', artist: 'Ethic Entertainment', genre: 'Gengetone' },
  ],
  reflective: [
    { name: 'Melanin', artist: 'Sauti Sol', genre: 'Soul' },
    { name: 'Nairobi', artist: 'Khaligraph Jones', genre: 'Hip-Hop' },
    { name: 'Undo', artist: 'Bensoul', genre: 'R&B' },
  ],
  chill: [
    { name: 'Bado', artist: 'Otile Brown', genre: 'Bongo Flava' },
    { name: 'Finesse', artist: 'Nviiri the Storyteller', genre: 'Afropop' },
    { name: 'Radio', artist: 'Sauti Sol', genre: 'Afropop' },
  ],
  romantic: [
    { name: 'Suzanna', artist: 'Sauti Sol', genre: 'Afropop' },
    { name: 'Love Like This', artist: 'Otile Brown', genre: 'R&B' },
    { name: 'Dawa ya Mapenzi', artist: 'Jovial', genre: 'Afropop' },
  ],
  grind: [
    { name: 'Mtu Wa Pesa', artist: 'Khaligraph Jones', genre: 'Hip-Hop' },
    { name: 'Khali Cartel', artist: 'Various Artists', genre: 'Rap' },
    { name: 'Yes Bana', artist: 'Khaligraph Jones', genre: 'Hip-Hop' },
  ],
};

export const NAIROBI_VIBE_TAGS = {
  happy: 'CBD Madharau Energy 🌟🎉',
  sad: 'Otieno wa Blue House Energy 💙🌧️',
  hype: 'Githurai 45 Friday Night Energy 🔥🚍',
  reflective: 'Uhuru Park Midnight Walk Energy 🌙🌳',
  chaotic: 'Nganya Rush Hour Energy ⚡🚍🔊',
  chill: 'Karen Sunset Sundowner Energy 🌅🍃',
  romantic: 'Westlands Date Night Energy ❤️✨',
  grind: 'Gikomba Monday Hustle Energy 💪💰',
};

export function detectMoodFromText(text) {
  const normalized = text.toLowerCase();
  if (/heartbroken|sad|miss|lonely|cry|blue|down|depressed|broke up|left me/.test(normalized)) return 'sad';
  if (/party|hype|lit|turnt|banger|vibes ziko|friday|turn up|club|dance/.test(normalized)) return 'hype';
  if (/chill|relax|calm|sunset|vibe|easy|mellow|breeze|slow/.test(normalized)) return 'chill';
  if (/love|romantic|date|her|him|bae|baby|sweetheart|crush/.test(normalized)) return 'romantic';
  if (/hustle|grind|work|money|pesa|mtu|boss|business|meeting/.test(normalized)) return 'grind';
  if (/chaos|crazy|nganya|rush|traffic|mad|wild|insane|chaotic|jam/.test(normalized)) return 'chaotic';
  if (/deep|think|reflect|alone|late night|midnight|peace|quiet/.test(normalized)) return 'reflective';
  return 'happy';
}
