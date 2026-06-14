import { useEffect, useState } from 'react';
import { ROUTES, fetchWeatherData, fetchHeadlineItems, fetchBreakingItems } from '../data.js';
import { fetchNSEStocksProduction, fetchFootballScoresProduction } from '../productionDataFetchers.js';

function NSEStrip({ stocks = [] }) {
  const [offset, setOffset] = useState(0);
  const items = [...stocks, ...stocks];

  useEffect(() => {
    const id = setInterval(() => setOffset((current) => (current - 1) % (Math.max(stocks.length, 1) * 120)), 30);
    return () => clearInterval(id);
  }, [stocks.length]);

  if (!stocks || stocks.length === 0) return null;

  return (
    <div className="nse-strip">
      <span className="nse-label">NSE</span>
      <div className="nse-scroll">
        <div className="nse-track" style={{ transform: `translateX(${offset}px)` }}>
          {items.map((stock, index) => (
            <span key={`${stock.sym || stock.ticker || index}-${index}`} className="nse-item">
              <span className="nse-symbol">{stock.sym || stock.ticker || 'N/A'}</span>
              <span className={stock.up ? 'nse-positive' : 'nse-negative'}>{stock.price || stock.last || '-'}</span>
              <span className={stock.up ? 'nse-positive' : 'nse-negative'}>{stock.change || stock.diff || ''}</span>
            </span>
          ))}
        </div>
      </div>
      <span className="nse-live">LIVE</span>
    </div>
  );
}

function BreakingTicker({ breakingItems = [] }) {
  if (!breakingItems || breakingItems.length === 0) return null;
  return (
    <div className="ticker-bar">
      <span className="ticker-label">BREAKING NRB</span>
      <div className="ticker-scroll">
        {breakingItems.map((item, index) => (
          <span key={index} className="ticker-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function WeatherCard({ weather = {} }) {
  if (!weather) return null;
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
            <div className="weather-temp">{weather.temp ?? '--'}°</div>
            <p className="weather-condition">{weather.condition ?? ''} · Feels {weather.feels ?? '--'}°</p>
          </div>
          <div className="weather-aqi">
            <span>AQI</span>
            <strong>{weather.aqi ?? '—'}</strong>
          </div>
        </div>
        <div className="weather-grid">
          <div className="weather-stat">
            <i className="ti ti-droplet" />
            <div>Humidity</div>
            <strong>{weather.humidity ?? '--'}%</strong>
          </div>
          <div className="weather-stat">
            <i className="ti ti-wind" />
            <div>Wind</div>
            <strong>{weather.wind ?? '--'} km/h</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function FootballCard({ matches = [] }) {
  if (!matches || matches.length === 0) return (
    <div className="card scores-card"><div className="card-body">No live scores</div></div>
  );

  return (
    <div className="card scores-card">
      <div className="card-header header-scores">
        <span className="card-header-dot" />
        <span className="card-header-label">Live Scores</span>
        <i className="ti ti-ball-football" />
      </div>
      <div className="card-body card-body-compact">
        {matches.map((match, index) => (
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

function HeadlinesCard({ headlines = [] }) {
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
        {headlines.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No headlines available</p>
        ) : (
          headlines.map((item, index) => (
            <div key={index} className="headline-item">
              <span className="headline-tag" style={tagStyle[item.tag] || {}}>{item.tag}</span>
              <p className="headline-text">{item.title}</p>
            </div>
          ))
        )}
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
  const [weatherData, setWeatherData] = useState(null);
  const [headlines, setHeadlines] = useState([]);
  const [breakingData, setBreakingData] = useState([]);
  const [nseStocks, setNseStocks] = useState([]);
  const [footballMatches, setFootballMatches] = useState([]);

  useEffect(() => {
    async function loadPulseData() {
      try {
        const [weather, heads, breaking, stocks, matches] = await Promise.all([
          fetchWeatherData(),
          fetchHeadlineItems(),
          fetchBreakingItems(),
          fetchNSEStocksProduction(),
          fetchFootballScoresProduction(),
        ]);
        if (weather) setWeatherData(weather);
        if (Array.isArray(heads)) setHeadlines(heads);
        if (Array.isArray(breaking)) setBreakingData(breaking);
        if (Array.isArray(stocks)) setNseStocks(stocks);
        if (Array.isArray(matches)) setFootballMatches(matches);
      } catch (err) {
        console.error('Error loading pulse data:', err);
      }
    }

    loadPulseData();
    const intervalId = setInterval(loadPulseData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="module-wrapper pulse-module">
      <BreakingTicker breakingItems={breakingData} />
      <NSEStrip stocks={nseStocks} />
      <StatCards />
      <div className="pulse-row">
        <WeatherCard weather={weatherData} />
        <FootballCard matches={footballMatches} />
      </div>
      <RouteBoard />
      <HeadlinesCard headlines={headlines} />
      <div className="pulse-footer">Nairobi, Kenya · Data refreshes every 60s</div>
    </div>
  );
}
