import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import PageFooter from '../components/PageFooter.jsx';
import { PAGE_IMAGES } from '../data/pageImages.js';

export default function EventCalendarPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'networking',
  });

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'networking', label: 'Networking' },
    { value: 'concert', label: 'Concert' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'community', label: 'Community' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadEvents();
  }, [isAuthenticated, navigate]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`*, profiles:user_id(full_name, avatar_url), event_attendees(user_id)`)
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) return;

    try {
      const { error } = await supabase.from('events').insert({
        user_id: user.id,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        category: newEvent.category,
      });

      if (error) throw error;

      setShowCreateEvent(false);
      setNewEvent({ title: '', description: '', date: '', location: '', category: 'networking' });
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      const { data: existingRSVP } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingRSVP) {
        await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', user.id);
      } else {
        await supabase.from('event_attendees').insert({ event_id: eventId, user_id: user.id });
      }

      loadEvents();
    } catch (error) {
      console.error('Error RSVPing to event:', error);
    }
  };

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter((event) => event.category === selectedCategory);

  const weekendCount = events.filter((event) => {
    const d = new Date(event.date);
    const day = d.getDay();
    return day === 5 || day === 6 || day === 0;
  }).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-events">
      <div className="page-events__split">
        <div className="page-events__list-side">
          <div className="np-page-header">
            <h1>Events</h1>
            <button type="button" className="np-btn-primary" onClick={() => setShowCreateEvent(true)}>
              Create Event
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={selectedCategory === category.value ? 'np-btn-primary' : 'np-btn-cancel'}
                style={{ flex: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 12 }}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>

          {filteredEvents.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>No events found.</p>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="page-events__card scroll-reveal">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ background: 'rgba(255,214,0,0.2)', color: '#FFD600', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold' }}>
                    {event.category}
                  </span>
                  <span style={{ color: '#666', fontSize: 11 }}>{formatDate(event.date)}</span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{event.title}</h3>
                <p style={{ margin: '0 0 12px', color: '#888', fontSize: 13 }}>{event.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: '#666', fontSize: 12 }}>📍 {event.location}</span>
                  <button
                    type="button"
                    className="np-btn-primary"
                    style={{ flex: 'none', padding: '6px 12px', fontSize: 12 }}
                    onClick={() => handleRSVP(event.id)}
                  >
                    {event.event_attendees?.some((a) => a.user_id === user.id) ? '✓ RSVPed' : 'RSVP'}
                  </button>
                </div>
              </div>
            ))
          )}

          <PageFooter />
        </div>

        <div className="page-events__visual">
          <img className="city-image-load" src={PAGE_IMAGES.events.src} alt={PAGE_IMAGES.events.alt} />
          <div className="page-events__visual-gradient" />
          <span className="page-events__event-badge">
            {weekendCount || 12} EVENTS THIS WEEKEND
          </span>
        </div>
      </div>

      {showCreateEvent && (
        <div className="np-modal-overlay">
          <div className="np-modal">
            <div className="np-modal__header">
              <h3>Create Event</h3>
              <button type="button" className="np-modal__close" onClick={() => setShowCreateEvent(false)}>×</button>
            </div>
            <div className="np-form-group">
              <label>Title</label>
              <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Description</label>
              <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Date</label>
              <input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Location</label>
              <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Category</label>
              <select value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}>
                {categories.filter((c) => c.value !== 'all').map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="np-modal__footer">
              <button type="button" className="np-btn-cancel" onClick={() => setShowCreateEvent(false)}>Cancel</button>
              <button type="button" className="np-btn-primary" onClick={handleCreateEvent}>Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
