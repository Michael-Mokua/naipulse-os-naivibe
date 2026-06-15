import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';

export default function SmartCarpoolPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [rides, setRides] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [showPostRide, setShowPostRide] = useState(false);
  const [newRide, setNewRide] = useState({
    origin: '',
    destination: '',
    departure_time: '',
    seats_available: 1,
    is_women_only: false,
    price: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadRides();
  }, [isAuthenticated, navigate]);

  const loadRides = async () => {
    try {
      const { data, error } = await supabase
        .from('carpool_rides')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url),
          carpool_bookings(user_id)
        `)
        .order('departure_time', { ascending: true });

      if (error) throw error;
      setRides(data || []);
    } catch (error) {
      console.error('Error loading rides:', error);
    }
  };

  const handlePostRide = async () => {
    if (!newRide.origin || !newRide.destination || !newRide.departure_time) return;

    try {
      const { error } = await supabase
        .from('carpool_rides')
        .insert({
          user_id: user.id,
          origin: newRide.origin,
          destination: newRide.destination,
          departure_time: newRide.departure_time,
          seats_available: parseInt(newRide.seats_available),
          is_women_only: newRide.is_women_only,
          price: parseFloat(newRide.price)
        });

      if (error) throw error;

      setShowPostRide(false);
      setNewRide({
        origin: '',
        destination: '',
        departure_time: '',
        seats_available: 1,
        is_women_only: false,
        price: ''
      });
      loadRides();
    } catch (error) {
      console.error('Error posting ride:', error);
    }
  };

  const handleBookRide = async (rideId) => {
    try {
      const { data: existingBooking } = await supabase
        .from('carpool_bookings')
        .select('*')
        .eq('ride_id', rideId)
        .eq('user_id', user.id)
        .single();

      if (existingBooking) {
        await supabase
          .from('carpool_bookings')
          .delete()
          .eq('ride_id', rideId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('carpool_bookings')
          .insert({
            ride_id: rideId,
            user_id: user.id
          });
      }

      loadRides();
    } catch (error) {
      console.error('Error booking ride:', error);
    }
  };

  const filteredRides = selectedType === 'all' 
    ? rides 
    : rides.filter(ride => selectedType === 'women_only' ? ride.is_women_only : !ride.is_women_only);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-KE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="carpool-page">
      <div className="carpool-header">
        <h1>🚗 Smart Carpooling</h1>
        <button className="post-ride-btn" onClick={() => setShowPostRide(true)}>
          ➕ Post Ride
        </button>
      </div>

      <div className="carpool-filters">
        <button 
          className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedType('all')}
        >
          All Rides
        </button>
        <button 
          className={`filter-btn ${selectedType === 'women_only' ? 'active' : ''}`}
          onClick={() => setSelectedType('women_only')}
        >
          Women-Only
        </button>
        <button 
          className={`filter-btn ${selectedType === 'mixed' ? 'active' : ''}`}
          onClick={() => setSelectedType('mixed')}
        >
          Mixed
        </button>
      </div>

      <div className="rides-list">
        {filteredRides.length === 0 ? (
          <div className="no-rides">
            <p>No rides available. Post one to get started!</p>
          </div>
        ) : (
          filteredRides.map(ride => (
            <div key={ride.id} className="ride-card">
              <div className="ride-header">
                <div className="ride-route">
                  <span className="origin">{ride.origin}</span>
                  <span className="arrow">→</span>
                  <span className="destination">{ride.destination}</span>
                </div>
                {ride.is_women_only && (
                  <span className="women-badge">Women-Only</span>
                )}
              </div>

              <div className="ride-details">
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span className="detail-text">{formatTime(ride.departure_time)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💺</span>
                  <span className="detail-text">{ride.seats_available} seats available</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span className="detail-text">KES {ride.price}</span>
                </div>
              </div>

              <button 
                className={`book-btn ${ride.carpool_bookings?.some(b => b.user_id === user.id) ? 'booked' : ''}`}
                onClick={() => handleBookRide(ride.id)}
              >
                {ride.carpool_bookings?.some(b => b.user_id === user.id) ? '✓ Booked' : 'Book Ride'}
              </button>
            </div>
          ))
        )}
      </div>

      {showPostRide && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Post Ride</h3>
              <button onClick={() => setShowPostRide(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Origin</label>
                <input
                  type="text"
                  value={newRide.origin}
                  onChange={(e) => setNewRide({...newRide, origin: e.target.value})}
                  placeholder="Starting point..."
                />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input
                  type="text"
                  value={newRide.destination}
                  onChange={(e) => setNewRide({...newRide, destination: e.target.value})}
                  placeholder="Destination..."
                />
              </div>
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="datetime-local"
                  value={newRide.departure_time}
                  onChange={(e) => setNewRide({...newRide, departure_time: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Seats Available</label>
                <input
                  type="number"
                  value={newRide.seats_available}
                  onChange={(e) => setNewRide({...newRide, seats_available: e.target.value})}
                  min="1"
                  max="8"
                />
              </div>
              <div className="form-group">
                <label>Price (KES)</label>
                <input
                  type="number"
                  value={newRide.price}
                  onChange={(e) => setNewRide({...newRide, price: e.target.value})}
                  placeholder="Price per seat..."
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newRide.is_women_only}
                    onChange={(e) => setNewRide({...newRide, is_women_only: e.target.checked})}
                  />
                  <span>Women-Only Ride</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowPostRide(false)} className="cancel-btn">Cancel</button>
              <button onClick={handlePostRide} className="submit-btn">Post Ride</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .carpool-page {
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%),
            url('/assets/massai-tribesmen-kenya.jpg') center/cover;
          border-radius: 16px;
          padding: 24px;
          margin: 16px;
          border: 2px solid rgba(52, 199, 89, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 600px;
        }

        .carpool-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .carpool-header h1 {
          color: #34C759;
          font-size: 24px;
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
        }

        .post-ride-btn {
          background: linear-gradient(135deg, #34C759, #28a745);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .carpool-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ccc;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #34C759, #28a745);
          border-color: transparent;
          color: white;
          font-weight: bold;
        }

        .rides-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-rides {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .ride-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s;
        }

        .ride-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(52, 199, 89, 0.3);
        }

        .ride-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ride-route {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .origin,
        .destination {
          color: #fff;
          font-size: 14px;
          font-weight: bold;
        }

        .arrow {
          color: #666;
        }

        .women-badge {
          background: rgba(255, 107, 53, 0.2);
          color: #FF6B35;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .ride-details {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .detail-icon {
          font-size: 14px;
        }

        .detail-text {
          color: #888;
          font-size: 12px;
        }

        .book-btn {
          background: linear-gradient(135deg, #34C759, #28a745);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          width: 100%;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          background: #1a1a2e;
          padding: 24px;
          border-radius: 16px;
          max-width: 400px;
          width: 90%;
          border: 2px solid #34C759;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #34C759;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
        }

        .modal-body {
          margin-bottom: 20px;
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

        .modal-footer {
          display: flex;
          gap: 12px;
        }

        .cancel-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .submit-btn {
          flex: 1;
          background: linear-gradient(135deg, #34C759, #28a745);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .carpool-page {
            padding: 16px;
            margin: 8px;
          }

          .carpool-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .ride-details {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
