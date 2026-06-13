import { useState } from 'react';
import useNow from './hooks/useNow';
import PulseModule from './modules/PulseModule.jsx';
import TruthModule from './modules/TruthModule.jsx';
import VibeModule from './modules/VibeModule.jsx';
import { HERO_IMAGE_URL, PAGE_BACKGROUND_URL, HERO_ACCENT_IMAGES, CREATOR_FEED } from './data.js';

const tabs = [
  { id: 'pulse', icon: 'ti-bus', label: 'PULSE', activeClass: 'active-pulse' },
  { id: 'truth', icon: 'ti-brain', label: 'TRUTH', activeClass: 'active-truth' },
  { id: 'vibe', icon: 'ti-headphones', label: 'NAIVIBE', activeClass: 'active-vibe' },
];

const heroStats = [
  { label: 'Westlands Night', value: '22°', detail: 'Partly Cloudy · Nyumba ya Wakenya', icon: 'ti-cloud-sun' },
  { label: 'NSE 20', value: '+1.2%', detail: 'Banks pushing the index', icon: 'ti-chart-line' },
  { label: 'Nganya Alert', value: '59 min', detail: 'Boarding zone full', icon: 'ti-bolt' },
];

function TopBar({ active, setActive }) {
  const now = useNow();
  const time = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <header className="topbar" role="banner">
      <div className="os-logo">
        <div className="os-logo-mark">N</div>
        <div>
          <span className="os-logo-text">NAI PULSE OS</span>
          <span className="os-logo-sub">Nairobi City Intelligence</span>
        </div>
      </div>

      <nav className="nav-tabs" role="navigation" aria-label="Module navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-tab ${active === tab.id ? tab.activeClass : ''}`}
            onClick={() => setActive(tab.id)}
            aria-current={active === tab.id ? 'page' : undefined}
          >
            <i className={`ti ${tab.icon}`} />
            {tab.label}
            {tab.id === 'pulse' && <div className="live-dot" />}
          </button>
        ))}
      </nav>

      <div className="topbar-time">
        <span>{time}</span>
        <span>{date} · Nairobi</span>
      </div>
    </header>
  );
}

function HeroSection({ active, setActive }) {
  return (
    <section
      className="hero-shell"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.88), rgba(10,10,10,0.97) 60%), url(${HERO_IMAGE_URL})`,
      }}
      aria-label="NaiPulse OS landing overview"
    >
      <div className="hero-image-patches">
        {HERO_ACCENT_IMAGES.map((src, index) => (
          <div key={src} className={`hero-image-patch patch-${index + 1}`} style={{ backgroundImage: `url(${src})` }} />
        ))}
      </div>
      <div className="hero-copy">
        <span className="hero-label">CITY PULSE. TRUTH ENGINE. STREET RADIO.</span>
        <h1 className="hero-title">NAI PULSE OS</h1>
        <p className="hero-tagline">
          Nairobi’s city intelligence platform turned into a neon nganya experience — live traffic, truth scanning, and the soundtrack of the street.
        </p>

        <div className="hero-cta-row">
          <button type="button" className="hero-cta" onClick={() => setActive('pulse')}>
            Tap the pulse
          </button>
          <span className="hero-chip">Built for the streets · Nairobi only</span>
        </div>

        <span className="hero-image-credit">Visuals sourced from Nairobi street archives</span>

        <div className="hero-status-row">
          <span className={`hero-status-badge ${active}`}>{active.toUpperCase()} MODE</span>
          <span className="hero-status-note">Switch routes like a matatu board below.</span>
        </div>
      </div>

      <div className="hero-side">
        <div className="hero-card-stack">
          {heroStats.map((stat) => (
            <div key={stat.label} className="hero-card">
              <div className="hero-card-icon">
                <i className={`ti ${stat.icon}`} />
              </div>
              <div>
                <span className="hero-card-label">{stat.label}</span>
                <strong className="hero-card-value">{stat.value}</strong>
                <p className="hero-card-detail">{stat.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hero-route-board">
          <div className="route-board-title">MATATU BOARD</div>
          <div className="hero-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`hero-route ${active === tab.id ? 'active-route' : ''}`}
                onClick={() => setActive(tab.id)}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleBar({ active }) {
  const colors = {
    pulse: '#00FF88',
    truth: '#7B2FFF',
    vibe: '#FF2D78',
  };

  return <div className="module-bar" style={{ background: `linear-gradient(90deg, ${colors[active]}, transparent)` }} />;
}

function ModuleContent({ active }) {
  return (
    <div className="main-content">
      {active === 'pulse' && <PulseModule />}
      {active === 'truth' && <TruthModule />}
      {active === 'vibe' && <VibeModule />}
    </div>
  );
}

function CreatorWall() {
  return (
    <section
      className="creator-wall"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.78) 65%), url(${PAGE_BACKGROUND_URL})`,
      }}
    >
      <div className="creator-header">
        <div>
          <span className="creator-label">MADE IN NAIROBI BY @WHOISMICHAIA</span>
          <h2 className="creator-title">THE ARTIST BEHIND THE CODE</h2>
        </div>
        <p className="creator-description">
          Curated snapshots of Nairobi street art, nganya culture, and the visuals that inspired the NaiPulse OS vibe.
        </p>
      </div>
      <div className="creator-grid">
        {CREATOR_FEED.map((item, index) => (
          <div
            key={index}
            className="creator-polaroid"
            style={{
              transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.6)), url(${item.image})`,
            }}
          >
            <div className="creator-caption">
              <strong>{item.caption}</strong>
              <span>{item.sub}</span>
              <span className="creator-source">{item.source}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState('pulse');

  return (
    <div className="os-shell">
      <div className="site-background" style={{ backgroundImage: `url(${PAGE_BACKGROUND_URL})` }} />
      <div className="site-accent-layer">
        {HERO_ACCENT_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`site-accent-piece accent-${index + 1}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className="city-grid-bg" />
      <div className="scanlines" />
      <div className="sticker-item sticker-neon-green" style={{ top: '80px', left: '20px', transform: 'rotate(-10deg)', opacity: 0.16, pointerEvents: 'none' }}>
        MANYANGA
      </div>
      <div className="sticker-item sticker-hot-pink" style={{ top: '150px', right: '30px', transform: 'rotate(15deg)', opacity: 0.16, pointerEvents: 'none' }}>
        CHAZA VIBE
      </div>

      <TopBar active={active} setActive={setActive} />
      <HeroSection active={active} setActive={setActive} />
      <ModuleBar active={active} />
      <ModuleContent active={active} />
      <CreatorWall />

      <footer className="app-footer">
        NAI PULSE OS · NAIVIBE · Nairobi, Kenya · Built for the streets 🚍🔥
      </footer>
    </div>
  );
}
