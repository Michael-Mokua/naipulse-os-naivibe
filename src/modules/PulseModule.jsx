import { useEffect, useState } from 'react';
import { BREAKING, FOOTBALL, HEADLINES, NSE_STOCKS, ROUTES, WEATHER_DATA } from '../data.js';

function NSEStrip() {
  const [offset, setOffset] = useState(0);
  const items = [...NSE_STOCKS, ...NSE_STOCKS];

  useEffect(() => {
    const id = setInterval(() => setOffset((current) => (current - 1) % (NSE_STOCKS.length * 120)), 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="nse-strip">
      <span className="nse-label">NSE</span>
      <div className="nse-scroll">
        <div className="nse-track" style={{ transform: `translateX(${offset}px)` }}>
          {items.map((stock, index) => (
            <span key={`${stock.sym}-${index}`} className="nse-item">
              <span className="nse-symbol">{stock.sym}</span>
              <span className={stock.up ? 'nse-positive' : 'nse-negative'}>{stock.price}</span>
              <span className={stock.up ? 'nse-positive' : 'nse-negative'}>{stock.change}</span>
            </span>
          ))}
        </div>
      </div>
      <span className="nse-live">LIVE</span>
    </div>
  );
}

function BreakingTicker() {
  return (
    <div className="ticker-bar">
      <span className="ticker-label">BREAKING NRB</span>
      <div className="ticker-scroll">
        {BREAKING.map((item, index) => (
          <span key={index} className="ticker-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function WeatherCard() {
  return (
    <div className="card weather-card">
      <div className="card-header header-weather">
        <span className="card-header-dot" />
        <span className="card-header-label">Nairobi Weather</span>
        <i className="ti ti-cloud-sun" />
      </div>
      <div className="card-body">
        <div className="weather-primary">
          <div>
            <div className="weather-temp">{WEATHER_DATA.temp}°</div>
            <p className="weather-condition">{WEATHER_DATA.condition} · Feels {WEATHER_DATA.feels}°</p>
          </div>
          <div className="weather-aqi">
            <span>AQI</span>
            <strong>{WEATHER_DATA.aqi}</strong>
          </div>
        </div>
        <div className="weather-grid">
          <div className="weather-stat">
            <i className="ti ti-droplet" />
            <div>Humidity</div>
            <strong>{WEATHER_DATA.humidity}%</strong>
          </div>
          <div className="weather-stat">
            <i className="ti ti-wind" />
            <div>Wind</div>
            <strong>{WEATHER_DATA.wind} km/h</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function FootballCard() {
  return (
    <div className="card scores-card">
      <div className="card-header header-scores">
        <span className="card-header-dot" />
        <span className="card-header-label">Live Scores</span>
        <i className="ti ti-ball-football" />
      </div>
      <div className="card-body card-body-compact">
        {FOOTBALL.map((match, index) => (
          <div key={index} className="match-row">
            <span className={match.live ? 'match-live' : 'match-competition'}>{match.live ? '● LIVE' : match.comp}</span>
            <span className="match-team">{match.home}</span>
            <span className="match-score">{match.score}</span>
            <span className="match-team right">{match.away}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteBoard() {
  const statusText = { jam: 'Heavy Jam', slow: 'Slow Moving', moving: 'Clear ✓' };

  return (
    <div className="card route-board">
      <div className="card-header header-routes">
        <span className="card-header-dot" />
        <span className="card-header-label">Matatu Routes — Live Status</span>
        <div className="live-dot" />
      </div>
      <div className="card-body route-grid">
        {ROUTES.map((route) => (
          <div key={route.num} className="route-chip" style={{ background: route.color, color: route.textColor }}>
            <span className="route-num">{route.num}</span>
            <div className="route-details">
              <div className="route-name">{route.name}</div>
              <div className="route-status">{statusText[route.status]}</div>
            </div>
            <i className={`ti ${route.status === 'jam' ? 'ti-alert-triangle' : route.status === 'slow' ? 'ti-clock' : 'ti-circle-check'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function HeadlinesCard() {
  const tagStyle = {
    Transport: { background: 'rgba(239,159,39,0.15)', color: '#EF9F27' },
    Business: { background: 'rgba(29,158,117,0.15)', color: '#1D9E75' },
    Weather: { background: 'rgba(55,138,221,0.15)', color: '#378ADD' },
    Tech: { background: 'rgba(127,119,221,0.15)', color: '#7F77DD' },
  };

  return (
    <div className="card headlines-card">
      <div className="card-header header-headlines">
        <span className="card-header-dot" />
        <span className="card-header-label">Nairobi Headlines</span>
        <i className="ti ti-news" />
      </div>
      <div className="card-body card-body-compact">
        {HEADLINES.map((item, index) => (
          <div key={index} className="headline-item">
            <span className="headline-tag" style={tagStyle[item.tag] || {}}>{item.tag}</span>
            <p className="headline-text">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCards() {
  const stats = [
    { icon: '🌡️', label: 'City Temp', value: '22°C', sub: 'Partly Cloudy', color: '#4A90D9' },
    { icon: '🚦', label: 'Traffic Index', value: '6.4', sub: 'Moderate — 14:00 peak', color: '#FFD600' },
    { icon: '📈', label: 'NSE 20 Index', value: '+1.2%', sub: 'Strong session', color: '#39FF14' },
    { icon: '👥', label: 'City Activity', value: 'HIGH', sub: 'CBD rush active', color: '#FF2D78' },
  ];

  return (
    <div className="stat-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card" style={{ borderColor: `${stat.color}25` }}>
          <span className="stat-card-icon">{stat.icon}</span>
          <span className="stat-card-label">{stat.label}</span>
          <span className="stat-card-value">{stat.value}</span>
          <span className="stat-card-sub">{stat.sub}</span>
        </div>
      ))}
    </div>
  );
}

export default function PulseModule() {
  return (
    <div className="module-wrapper pulse-module">
      <BreakingTicker />
      <NSEStrip />
      <StatCards />
      <div className="pulse-row">
        <WeatherCard />
        <FootballCard />
      </div>
      <RouteBoard />
      <HeadlinesCard />
      <div className="pulse-footer">Nairobi, Kenya · Data refreshes every 60s</div>
    </div>
  );
}
