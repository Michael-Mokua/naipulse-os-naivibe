/** Per-page Nairobi atmosphere images — not wallpapers, neighbourhoods. */
export const PAGE_IMAGES = {
  feed: {
    src: '/assets/nganya%20matatu.jpg',
    alt: 'Nganya rolling through Nairobi',
    caption: 'CBD rush · Route 46 energy',
  },
  chat: {
    src: '/assets/nairobi%20skyline.jpg',
    alt: 'Westlands after dark',
    caption: 'WESTLANDS · 23:00',
  },
  routes: {
    src: '/assets/nganya%20matatu.jpg',
    alt: 'Matatu routes across the city',
    caption: 'Thika Road · live board',
  },
  watch: {
    src: '/assets/june%20maandamano%20protests-youth%20kneeling%20on%20the%20road%20raising%20kenyan%20flag.jpg',
    alt: 'June 25 maandamano — youth kneeling with Kenyan flag',
    caption: 'The city watches. The city remembers.',
  },
  events: {
    src: '/assets/sign%20up%20page-maasai%20standing%20on%20a%20rock%20overlooking%20nairobi%20national%20part%20with%20cbd%20in%20the%20background.jpg',
    alt: 'Nairobi skyline from the plains',
    caption: 'Weekend pulse · city wide',
  },
  lostFound: {
    src: '/assets/nairobi%20skyline.jpg',
    alt: 'Nairobi skyline at dusk',
    caption: 'Nairobi, always finding what\'s lost',
  },
  carpool: {
    src: '/assets/nairobi%20skyline.jpg',
    alt: 'Windscreen view toward Westlands',
    caption: 'NAIROBI → WESTLANDS',
  },
};

/** Matatu route board cards — cropped sections of the routes image */
export const ROUTE_BOARD_CARDS = [
  { num: '46', status: 'CLEAR', statusKey: 'clear', objectPosition: '15% center' },
  { num: '11', status: 'JAM', statusKey: 'jam', objectPosition: '40% center' },
  { num: '23', status: 'CLEAR', statusKey: 'clear', objectPosition: '65% center' },
  { num: '19', status: 'SLOW', statusKey: 'slow', objectPosition: '90% center' },
];
