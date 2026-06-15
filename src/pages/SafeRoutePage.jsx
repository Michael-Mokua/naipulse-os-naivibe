import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';

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
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
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
    // Placeholder for real routing API integration
    // For now, we'll create a mock route
    if (!origin || !destination) return;

    const mockRoute = {
      origin_latitude: userLocation?.latitude || -1.286389,
      origin_longitude: userLocation?.longitude || 36.817223,
      destination_latitude: -1.2921,
      destination_longitude: 36.8219,
      route_data: {
        distance: Math.floor(Math.random() * 10) + 1,
        duration: Math.floor(Math.random() * 30) + 5,
        steps: ['Head north on main road', 'Turn right at intersection', 'Continue for 500m']
      },
      safety_score: Math.floor(Math.random() * 5) + 5,
      is_women_preferred: isWomenPreferred,
      transport_mode: transportMode
    };

    return mockRoute;
  };

  const handleSaveRoute = async (route) => {
    try {
      const { error } = await supabase
        .from('safe_routes')
        .insert({
          user_id: user.id,
          origin_latitude: route.origin_latitude,
          origin_longitude: route.origin_longitude,
          destination_latitude: route.destination_latitude,
          destination_longitude: route.destination_longitude,
          route_data: route.route_data,
          safety_score: route.safety_score,
          is_women_preferred: route.is_women_preferred,
          transport_mode: route.transport_mode
        });

      if (error) throw error;
      loadSavedRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  return (
    <div className="safe-route-page">
      <div className="route-header">
        <h1>🗺️ Safe Route Planning</h1>
        <button className="use-location-btn" onClick={getUserLocation}>
          📍 Use My Location
        </button>
      </div>

      <div className="route-form">
        <div className="form-group">
          <label>Origin (latitude, longitude)</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'e.g., -1.286389, 36.817223'}
          />
        </div>

        <div className="form-group">
          <label>Destination (latitude, longitude)</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., -1.2921, 36.8219"
          />
        </div>

        <div className="form-group">
          <label>Transport Mode</label>
          <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
            <option value="walking">Walking</option>
            <option value="driving">Driving</option>
            <option value="cycling">Cycling</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isWomenPreferred}
              onChange={(e) => setIsWomenPreferred(e.target.checked)}
            />
            <span>Women-Preferred Route</span>
          </label>
        </div>

        <button className="calculate-btn" onClick={handleCalculateRoute}>
          Calculate Route
        </button>
      </div>

      <div className="saved-routes">
        <h2>Saved Routes</h2>
        {routes.length === 0 ? (
          <p>No saved routes yet. Calculate a route to get started!</p>
        ) : (
          routes.map(route => (
            <div key={route.id} className="route-card">
              <div className="route-info">
                <span className="route-mode">{route.transport_mode}</span>
                <span className="route-safety">Safety Score: {route.safety_score}/10</span>
                {route.is_women_preferred && <span className="women-badge">Women-Preferred</span>}
              </div>
              <div className="route-details">
                <p>Distance: {route.route_data?.distance || 'N/A'} km</p>
                <p>Duration: {route.route_data?.duration || 'N/A'} min</p>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .safe-route-page {
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%),
            url('/assets/nairobi map.jpg') center/cover;
          border-radius: 16px;
          padding: 24px;
          margin: 16px;
          border: 2px solid rgba(0, 255, 136, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 600px;
        }

        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .route-header h1 {
          color: #00ff88;
          font-size: 24px;
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
        }

        .use-location-btn {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          border: none;
          color: #000;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .route-form {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          color: #ccc;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px;
          border-radius: 8px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #ccc;
          font-size: 12px;
        }

        .calculate-btn {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          border: none;
          color: #000;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          width: 100%;
        }

        .saved-routes h2 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 16px;
        }

        .routes-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .route-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
        }

        .route-info {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .route-mode {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
        }

        .women-badge {
          background: rgba(255, 107, 53, 0.2);
          color: #FF6B35;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
        }

        .safety-score {
          background: rgba(255, 215, 0, 0.2);
          color: #ffd700;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
        }

        .route-details p {
          color: #888;
          font-size: 12px;
          margin: 4px 0;
        }

        @media (max-width: 768px) {
          .safe-route-page {
            padding: 16px;
            margin: 8px;
          }

          .route-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
