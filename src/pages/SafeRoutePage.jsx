import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import PageFooter from '../components/PageFooter.jsx';
import { PAGE_IMAGES, ROUTE_BOARD_CARDS } from '../data/pageImages.js';

export default function SafeRoutePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState('walking');
  const [isWomenPreferred, setIsWomenPreferred] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    getUserLocation();
    loadSavedRoutes();
  }, [isAuthenticated, navigate]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  };

  const loadSavedRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('safe_routes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

  const handleCalculateRoute = async () => {
    if (!origin || !destination) return;
    // Placeholder for real routing API
  };

  return (
    <div className="page-routes">
      <div className="page-routes__board scroll-reveal">
        {ROUTE_BOARD_CARDS.map((card) => (
          <div key={card.num} className="route-status-card">
            <img
              className="city-image-load"
              src={PAGE_IMAGES.routes.src}
              alt={`Route ${card.num}`}
              style={{ objectPosition: card.objectPosition }}
            />
            <div className="route-status-card__overlay" />
            <span className="route-status-card__num">{card.num}</span>
            <span className={`route-status-card__badge ${card.statusKey}`}>{card.status}</span>
          </div>
        ))}
      </div>

      <div className="np-page-header">
        <h1>Safe Routes</h1>
        <button type="button" className="np-btn-primary" onClick={getUserLocation}>
          Use My Location
        </button>
      </div>

      <div className="page-feed__card scroll-reveal" style={{ marginBottom: 24 }}>
        <div className="np-form-group">
          <label>Origin (latitude, longitude)</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'e.g., -1.286389, 36.817223'}
          />
        </div>
        <div className="np-form-group">
          <label>Destination (latitude, longitude)</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., -1.2921, 36.8219"
          />
        </div>
        <div className="np-form-group">
          <label>Transport Mode</label>
          <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
            <option value="walking">Walking</option>
            <option value="driving">Driving</option>
            <option value="cycling">Cycling</option>
          </select>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ccc', fontSize: 12, marginBottom: 16, cursor: 'pointer' }}>
          <input type="checkbox" checked={isWomenPreferred} onChange={(e) => setIsWomenPreferred(e.target.checked)} />
          Women-Preferred Route
        </label>
        <button type="button" className="np-btn-primary" style={{ width: '100%' }} onClick={handleCalculateRoute}>
          Calculate Route
        </button>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 16 }}>Saved Routes</h2>
      {routes.length === 0 ? (
        <p style={{ color: '#666' }}>No saved routes yet. Calculate a route to get started!</p>
      ) : (
        routes.map((route) => (
          <div key={route.id} className="page-feed__card scroll-reveal" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(0,255,136,0.2)', color: '#00FF88', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>{route.transport_mode}</span>
              <span style={{ color: '#FFD600', fontSize: 11 }}>Safety: {route.safety_score}/10</span>
              {route.is_women_preferred && <span style={{ color: '#FF2D78', fontSize: 11 }}>Women-Preferred</span>}
            </div>
            <p style={{ margin: '4px 0', color: '#888', fontSize: 12 }}>Distance: {route.route_data?.distance || 'N/A'} km</p>
            <p style={{ margin: '4px 0', color: '#888', fontSize: 12 }}>Duration: {route.route_data?.duration || 'N/A'} min</p>
          </div>
        ))
      )}

      <PageFooter />
    </div>
  );
}
