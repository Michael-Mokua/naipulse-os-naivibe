import { useState } from 'react';
import { MOOD_CONFIGS, PLAYLIST_DATA, VIBE_PRESETS, NAIROBI_VIBE_TAGS, detectMoodFromText } from '../data.js';

function VibeBgBlobs({ mood }) {
  const cfg = MOOD_CONFIGS[mood] || MOOD_CONFIGS.happy;
  return (
    <div className="vibe-bg">
      <div className="vibe-bg-blob blob1" style={{ background: cfg.blob1 }} />
      <div className="vibe-bg-blob blob2" style={{ background: cfg.blob2 }} />
      <div className="vibe-bg-blob blob3" style={{ background: cfg.blob1, opacity: 0.12 }} />
    </div>
  );
}

function EnergyMeter({ level }) {
  return (
    <div className="energy-meter">
      <div className="energy-header">
        <span>Street Energy Meter</span>
        <strong>{level}%</strong>
      </div>
      <div className="energy-track">
        <div className="energy-thumb" style={{ left: `${level}%` }} />
      </div>
      <div className="energy-labels">
        <span>😴 Calm</span>
        <span>🚶 Chill</span>
        <span>🔥 Hype</span>
        <span>⚡ Chaotic NBI</span>
      </div>
    </div>
  );
}

function PlaylistCard({ mood }) {
  const tracks = PLAYLIST_DATA[mood] || PLAYLIST_DATA.happy;
  const [playing, setPlaying] = useState(null);

  return (
    <div className="playlist-card">
      <div className="playlist-header">
        <span className="playlist-badge">♫ SPOTIFY VIBES</span>
        <span>NAIVIBE PLAYLIST</span>
        <span>{tracks.length} tracks</span>
      </div>
      {tracks.map((track, index) => (
        <button
          key={index}
          type="button"
          className={`playlist-track ${playing === index ? 'playing' : ''}`}
          onClick={() => setPlaying(playing === index ? null : index)}
        >
          <div className="track-art">{playing === index ? '⏸' : '♫'}</div>
          <div className="track-info">
            <div className="track-name">{track.name}</div>
            <div className="track-artist">{track.artist}</div>
          </div>
          <div className="track-genre">{track.genre}</div>
        </button>
      ))}
      <div className="playlist-footer">Open full playlist on Spotify · Powered by NAIVIBE</div>
    </div>
  );
}

export default function VibeModule() {
  const [input, setInput] = useState('');
  const [mood, setMood] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [vibeTag, setVibeTag] = useState('');

  const currentMoodCfg = mood ? MOOD_CONFIGS[mood] : null;

  function analyzeVibe(text) {
    const value = text.trim();
    if (!value) return;
    setAnalyzing(true);
    setMood(null);
    setTimeout(() => {
      const detected = detectMoodFromText(value);
      setMood(detected);
      setVibeTag(NAIROBI_VIBE_TAGS[detected]);
      setAnalyzing(false);
    }, 800);
  }

  function usePreset(preset) {
    setInput(preset.label);
    analyzeVibe(preset.label);
  }

  return (
    <div className="module-wrapper vibe-module">
      {currentMoodCfg && <VibeBgBlobs mood={mood} />}
      <div className="vibe-panel">
        <div className="vibe-header">
          <span className="vibe-subtitle">NAI PULSE OS · CULTURE ENGINE</span>
          <h1 className="vibe-title">NAIVIBE</h1>
          <p className="vibe-description">Tell us your mood or moment and we’ll tune the Nairobi vibe.</p>
        </div>

        <div className="vibe-presets">
          {VIBE_PRESETS.map((preset) => (
            <button key={preset.label} type="button" className="mood-preset-btn" onClick={() => usePreset(preset)}>
              {preset.label}
            </button>
          ))}
        </div>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Describe your vibe..."
          rows={4}
          className="vibe-textarea"
        />

        <div className="truth-action-row">
          {mood && (
            <button type="button" className="truth-reset" onClick={() => { setInput(''); setMood(null); setVibeTag(''); }}>
              Reset
            </button>
          )}
          <button type="button" className="vibe-btn" onClick={() => analyzeVibe(input)} disabled={analyzing || !input.trim()}>
            {analyzing ? 'READING VIBE...' : 'READ MY VIBE'}
          </button>
        </div>

        {analyzing && <div className="vibe-loading">Tuning into Nairobi street energy...</div>}

        {currentMoodCfg && !analyzing && (
          <div className="vibe-result">
            <div className="mood-tag-display">
              <span className="mood-emoji">{currentMoodCfg.emoji}</span>
              <div className="nairobi-vibe-tag">{vibeTag}</div>
              <div className="mood-label-chip" style={{ borderColor: currentMoodCfg.color, color: currentMoodCfg.color }}>
                {currentMoodCfg.label}
              </div>
            </div>
            <EnergyMeter level={currentMoodCfg.energy} />
            <PlaylistCard mood={mood} />
          </div>
        )}
      </div>
    </div>
  );
}
