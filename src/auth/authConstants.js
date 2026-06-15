export const AUTH_IMAGES = {
  signup: '/signuplogin/sign up page-maasai standing on a rock overlooking nairobi national part with cbd in the background.jpg',
  login: '/signuplogin/june maandamano protests-youth kneeling on the road raising kenyan flag.jpg',
  skyline: '/signuplogin/nairobi skyline.jpg',
};

export const AUTH_ROUTE_TICKER = [
  '46 WESTLANDS',
  '11 EASTLEIGH',
  '23 KAWANGWARE',
  '58 GITHURAI',
  '34 LANGATA',
  '19 KASARANI',
  '105 THIKA RD',
  '33 RONGAI',
  '44 HURLINGHAM',
  '2 EMBAKASI',
];

export const STRENGTH_LEVELS = [
  { label: 'BADO KIDOGO', color: '#FF4444', width: '20%' },
  { label: 'KARIBU KARIBU', color: '#FFD600', width: '50%' },
  { label: 'SAWA SAWA', color: '#00FF88', width: '75%' },
  { label: 'POA KABISA ✓', color: '#00D4FF', width: '100%' },
];

export function getPasswordStrength(password) {
  if (!password) return -1;
  if (password.length < 5) return 0;
  if (password.length < 8) return 1;
  if (/[A-Z]/.test(password) && /\d/.test(password)) return 3;
  return 2;
}
