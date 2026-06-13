import { useState } from 'react';
import useNow from './hooks/useNow';
import PulseModule from './modules/PulseModule.jsx';
import TruthModule from './modules/TruthModule.jsx';
import VibeModule from './modules/VibeModule.jsx';

const tabs = [
  { id: 'pulse', icon: 'ti-bus', label: 'PULSE', activeClass: 'active-pulse' },
  { id: 'truth', icon: 'ti-brain', label: 'TRUTH', activeClass: 'active-truth' },
  { id: 'vibe', icon: 'ti-headphones', label: 'VIBE', activeClass: 'active-vibe' },
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

function ModuleBar({ active }) {
  const colors = {
    pulse: '#FFD600',
    truth: '#39FF14',
    vibe: '#FF2D78',
  };

  return (
    <div className="module-bar" style={{ background: `linear-gradient(90deg, ${colors[active]}, transparent)` }} />
  );
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

export default function App() {
  const [active, setActive] = useState('pulse');

  return (
    <div className="os-shell">
      <div className="city-grid-bg" />
      <div className="scanlines" />
      <div className="sticker-item sticker-neon-green" style={{ top: '80px', left: '20px', transform: 'rotate(-10deg)', opacity: 0.15, pointerEvents: 'none' }}>
        MANYANGA
      </div>
      <div className="sticker-item sticker-hot-pink" style={{ top: '150px', right: '30px', transform: 'rotate(15deg)', opacity: 0.15, pointerEvents: 'none' }}>
        CHAZA VIBE
      </div>

      <TopBar active={active} setActive={setActive} />
      <ModuleBar active={active} />
      <ModuleContent active={active} />

      <footer className="app-footer">
        NAI PULSE OS · NAIVIBE · Nairobi, Kenya · Built for the streets 🚍🔥
      </footer>
    </div>
  );
}
