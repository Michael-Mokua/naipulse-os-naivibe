# NAI PULSE OS

A Nairobi-inspired React + Vite prototype that blends live city pulse, truth scanning, and street radio into a graffiti-style visual experience.

## What’s included

- `src/App.jsx` — main shell, hero section, module navigation, and Nairobi image-driven UI.
- `src/data.js` — content sources, local asset image references, and feed data.
- `src/styles.css` — neon Nairobi / matatu / street art visual system.
- `public/assets/` — local photo assets used for hero textures, background layers, and creator cards.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5174` in your browser.

## Build

```bash
npm run build
```

## Notes

- The app now uses local Nairobi imagery from `public/assets/` instead of external image references.
- The hero attribution was updated to reflect local street visuals.
- Temporary search/download artifacts are excluded from the repository via `.gitignore`.
