import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import PageFooter from '../components/PageFooter.jsx';
import { PAGE_IMAGES } from '../data/pageImages.js';

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
    price: '',
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
        .select(`*, profiles:user_id(full_name, avatar_url), carpool_bookings(user_id)`)
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
      const { error } = await supabase.from('carpool_rides').insert({
        user_id: user.id,
        origin: newRide.origin,
        destination: newRide.destination,
        departure_time: newRide.departure_time,
        seats_available: parseInt(newRide.seats_available, 10),
        is_women_only: newRide.is_women_only,
        price: parseFloat(newRide.price),
      });

      if (error) throw error;

      setShowPostRide(false);
      setNewRide({ origin: '', destination: '', departure_time: '', seats_available: 1, is_women_only: false, price: '' });
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
        await supabase.from('carpool_bookings').delete().eq('ride_id', rideId).eq('user_id', user.id);
      } else {
        await supabase.from('carpool_bookings').insert({ ride_id: rideId, user_id: user.id });
      }

      loadRides();
    } catch (error) {
      console.error('Error booking ride:', error);
    }
  };

  const filteredRides = selectedType === 'all'
    ? rides
    : rides.filter((ride) => (selectedType === 'women_only' ? ride.is_women_only : !ride.is_women_only));

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-carpool">
      <div className="page-carpool__windscreen scroll-reveal">
        <div className="page-carpool__gps">[ NAIROBI → WESTLANDS · 14 KM · ETA 32 MIN ]</div>
        <img className="city-image-load" src={PAGE_IMAGES.carpool.src} alt={PAGE_IMAGES.carpool.alt} />
        <div className="page-carpool__hud-lines" />
        <div className="page-carpool__windscreen-fade" />
      </div>

      <div className="np-page-header">
        <h1>Smart Carpool</h1>
        <button type="button" className="np-btn-primary" onClick={() => setShowPostRide(true)}>
          Post Ride
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', 'women_only', 'mixed'].map((type) => (
          <button
            key={type}
            type="button"
            className={selectedType === type ? 'np-btn-primary' : 'np-btn-cancel'}
            style={{ flex: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 12 }}
            onClick={() => setSelectedType(type)}
          >
            {type === 'all' ? 'All Rides' : type === 'women_only' ? 'Women-Only' : 'Mixed'}
          </button>
        ))}
      </div>

      {filteredRides.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>No rides available.</p>
      ) : (
        filteredRides.map((ride) => (
          <div key={ride.id} className="page-feed__card scroll-reveal" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 'bold' }}>
                <span>{ride.origin}</span>
                <span style={{ color: '#00FF88' }}>→</span>
                <span>{ride.destination}</span>
              </div>
              {ride.is_women_only && (
                <span style={{ color: '#FF2D78', fontSize: 10, fontWeight: 'bold' }}>Women-Only</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap', fontSize: 12, color: '#888' }}>
              <span>🕐 {formatTime(ride.departure_time)}</span>
              <span>💺 {ride.seats_available} seats</span>
              <span>💰 KES {ride.price}</span>
            </div>
            <button
              type="button"
              className="np-btn-primary"
              style={{ width: '100%' }}
              onClick={() => handleBookRide(ride.id)}
            >
              {ride.carpool_bookings?.some((b) => b.user_id === user.id) ? '✓ Booked' : 'Book Ride'}
            </button>
          </div>
        ))
      )}

      <PageFooter />

      {showPostRide && (
        <div className="np-modal-overlay">
          <div className="np-modal">
            <div className="np-modal__header">
              <h3>Post Ride</h3>
              <button type="button" className="np-modal__close" onClick={() => setShowPostRide(false)}>×</button>
            </div>
            <div className="np-form-group">
              <label>Origin</label>
              <input type="text" value={newRide.origin} onChange={(e) => setNewRide({ ...newRide, origin: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Destination</label>
              <input type="text" value={newRide.destination} onChange={(e) => setNewRide({ ...newRide, destination: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Departure Time</label>
              <input type="datetime-local" value={newRide.departure_time} onChange={(e) => setNewRide({ ...newRide, departure_time: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Seats Available</label>
              <input type="number" value={newRide.seats_available} onChange={(e) => setNewRide({ ...newRide, seats_available: e.target.value })} min="1" max="8" />
            </div>
            <div className="np-form-group">
              <label>Price (KES)</label>
              <input type="number" value={newRide.price} onChange={(e) => setNewRide({ ...newRide, price: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ccc', fontSize: 12, marginBottom: 16 }}>
              <input type="checkbox" checked={newRide.is_women_only} onChange={(e) => setNewRide({ ...newRide, is_women_only: e.target.checked })} />
              Women-Only Ride
            </label>
            <div className="np-modal__footer">
              <button type="button" className="np-btn-cancel" onClick={() => setShowPostRide(false)}>Cancel</button>
              <button type="button" className="np-btn-primary" onClick={handlePostRide}>Post Ride</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
