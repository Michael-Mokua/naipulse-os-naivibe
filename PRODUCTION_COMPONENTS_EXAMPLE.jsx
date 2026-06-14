/**
 * Production Component Integration Example
 * How to replace development data with real production APIs
 */

import { useState, useEffect } from 'react';

// ============ WEATHER CARD (Production Version) ============

export function WeatherCardProduction() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/weather');
        
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
        console.error('Weather fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="card weather-card">Loading weather...</div>;
  if (error) return <div className="card weather-card">Error: {error}</div>;

  return (
    <div className="card weather-card">
      <div className="card-header header-weather">
        <span className="card-header-dot" />
        <span className="card-header-label">Nairobi Weather (Live)</span>
        <i className="ti ti-cloud-sun" />
      </div>
      <div className="card-body">
        <div className="weather-primary">
          <div>
            <div className="weather-temp">{weather.temp}°</div>
            <p className="weather-condition">
              {weather.condition} · Feels {weather.feels}°
            </p>
          </div>
          <div className="weather-aqi">
            <span>AQI</span>
            <strong>{weather.aqi}</strong>
          </div>
        </div>
        <div className="weather-grid">
          <div className="weather-stat">
            <i className="ti ti-droplet" />
            <div>Humidity</div>
            <strong>{weather.humidity}%</strong>
          </div>
          <div className="weather-stat">
            <i className="ti ti-wind" />
            <div>Wind</div>
            <strong>{weather.wind} km/h</strong>
          </div>
        </div>
        <small style={{ opacity: 0.7, marginTop: '0.5rem', display: 'block' }}>
          Last updated: {new Date(weather.timestamp).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
}

// ============ HEADLINES CARD (Production Version) ============

export function HeadlinesCardProduction() {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/headlines');
        
        if (!response.ok) {
          throw new Error(`Headlines API error: ${response.status}`);
        }
        
        const data = await response.json();
        setHeadlines(data.headlines || []);
      } catch (err) {
        setError(err.message);
        console.error('Headlines fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadlines();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchHeadlines, 1800000);
    return () => clearInterval(interval);
  }, []);

  const tagStyle = {
    Transport: { background: 'rgba(239,159,39,0.15)', color: '#EF9F27' },
    Business: { background: 'rgba(29,158,117,0.15)', color: '#1D9E75' },
    Weather: { background: 'rgba(55,138,221,0.15)', color: '#378ADD' },
    Tech: { background: 'rgba(127,119,221,0.15)', color: '#7F77DD' },
  };

  if (loading) return <div className="card headlines-card">Loading headlines...</div>;

  return (
    <div className="card headlines-card">
      <div className="card-header header-headlines">
        <span className="card-header-dot" />
        <span className="card-header-label">Nairobi Headlines (Live)</span>
        <i className="ti ti-news" />
      </div>
      <div className="card-body card-body-compact">
        {headlines.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No headlines available</p>
        ) : (
          headlines.map((item, index) => (
            <div key={index} className="headline-item">
              <span className="headline-tag" style={tagStyle[item.tag] || {}}>
                {item.tag}
              </span>
              <p className="headline-text">{item.title}</p>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', opacity: 0.6 }}
                >
                  Read more →
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============ BREAKING NEWS TICKER (Production Version) ============

export function BreakingTickerProduction() {
  const [breaking, setBreaking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const response = await fetch('/api/breaking');
        
        if (response.ok) {
          const data = await response.json();
          setBreaking(data.breaking || []);
        }
      } catch (err) {
        console.error('Breaking news fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBreaking();
    
    // Refresh every 2 minutes (breaking news changes fast)
    const interval = setInterval(fetchBreaking, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="ticker-bar">Loading breaking news...</div>;

  return (
    <div className="ticker-bar">
      <span className="ticker-label">BREAKING NRB (LIVE)</span>
      <div className="ticker-scroll">
        {breaking.map((item, index) => (
          <span key={index} className="ticker-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============ FACT CHECKER (Production Version) ============

export function TruthModuleProduction() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function checkClaimProduction() {
    if (!claim.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim }),
      });

      if (!response.ok) {
        throw new Error(`Verify API error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err.message);
      console.error('Claim verification failed:', err);
    } finally {
      setLoading(false);
    }
  }

  const VERDICT_CONFIG = {
    TRUE: { label: 'Verified True', color: '#0F6E56', bg: '#E1F5EE', icon: 'ti-circle-check' },
    FALSE: { label: 'False', color: '#993C1D', bg: '#FAECE7', icon: 'ti-circle-x' },
    MISLEADING: { label: 'Misleading', color: '#854F0B', bg: '#FAEEDA', icon: 'ti-alert-triangle' },
    UNVERIFIED: { label: 'Unverified', color: '#533AB7', bg: '#EEEDFE', icon: 'ti-help-circle' },
  };

  const verdict = result && VERDICT_CONFIG[result.verdict];

  return (
    <div className="module-wrapper truth-module">
      <div className="truth-hero">
        <div className="truth-tag">NAI PULSE OS · FACT CHECKER (PRODUCTION)</div>
        <h1 className="truth-title">VERIFY WITH AI</h1>
        <p className="truth-subtitle">
          Paste any claim. GROQ searches the web and AI synthesizes a verdict.
        </p>
      </div>

      <div className="truth-input-wrap">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="e.g. 'Expressway toll reduced by 20% for motorcycles'"
          rows={4}
          className="truth-textarea"
        />
        <div className="truth-action-row">
          <span className="truth-keytip">Ctrl+Enter to verify</span>
          <button
            className="truth-btn"
            onClick={checkClaimProduction}
            disabled={loading || !claim.trim()}
          >
            {loading ? 'VERIFYING...' : 'VERIFY CLAIM'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#E24B4A', padding: '1rem' }}>Error: {error}</div>}

      {loading && <div className="truth-loading">Searching web sources via GROQ...</div>}

      {result && verdict && (
        <div className="truth-result">
          <div className="verdict-card" style={{ background: verdict.bg, borderColor: verdict.color }}>
            <div className="verdict-header">
              <i className={`ti ${verdict.icon}`} style={{ color: verdict.color }} />
              <div>
                <div className="verdict-label">{verdict.label}</div>
                <div className="verdict-confidence">
                  {result.confidence}% confidence
                </div>
              </div>
            </div>
            <p className="verdict-summary">{result.summary}</p>
            {result.sources && (
              <div className="sources-panel">
                <div className="sources-title">Sources checked</div>
                {result.sources.map((source, index) => (
                  <div key={index} className="source-row">
                    <span className={`source-stance source-${source.stance}`}>
                      {source.stance}
                    </span>
                    <a href={source.url} target="_blank" rel="noreferrer" className="source-link">
                      {source.title}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="truth-reset"
            onClick={() => {
              setClaim('');
              setResult(null);
            }}
          >
            Check another claim
          </button>
        </div>
      )}
    </div>
  );
}

// ============ BATCH FETCH HOOK (Fetch multiple data types at once) ============

export function useBatchFetch(types) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/batch?types=${types.join(',')}`);
        
        if (!response.ok) {
          throw new Error(`Batch API error: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result.results);
      } catch (err) {
        setError(err.message);
        console.error('Batch fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [types.join(',')]);

  return { data, loading, error };
}

// ============ USAGE IN MAIN APP ============

/**
 * Example: Replace development PulseModule with production version
 * 
 * import { useBatchFetch } from './components/ProductionComponents.jsx';
 * 
 * export default function PulseModuleProduction() {
 *   const { data, loading, error } = useBatchFetch([
 *     'weather',
 *     'headlines',
 *     'breaking',
 *     'stocks',
 *     'football',
 *     'matatu'
 *   ]);
 * 
 *   if (loading) return <div>Loading pulse...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return (
 *     <div className="module-wrapper pulse-module">
 *       <BreakingTickerProduction />
 *       {data.stocks?.data && <StocksTicker stocks={data.stocks.data} />}
 *       <WeatherCardProduction />
 *       {data.football?.data && <FootballCard matches={data.football.data} />}
 *       <HeadlinesCardProduction />
 *     </div>
 *   );
 * }
 */
