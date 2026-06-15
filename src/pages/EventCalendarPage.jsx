import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';

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
    category: 'networking'
  });

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'networking', label: 'Networking' },
    { value: 'concert', label: 'Concert' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'community', label: 'Community' }
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
        .select(`
          *,
          profiles:user_id(full_name, avatar_url),
          event_attendees(user_id)
        `)
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
      const { error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          location: newEvent.location,
          category: newEvent.category
        });

      if (error) throw error;

      setShowCreateEvent(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'networking'
      });
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
        await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id
          });
      }

      loadEvents();
    } catch (error) {
      console.error('Error RSVPing to event:', error);
    }
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="event-calendar-page">
      <div className="event-header">
        <h1>📅 Event Calendar</h1>
        <button className="create-event-btn" onClick={() => setShowCreateEvent(true)}>
          ➕ Create Event
        </button>
      </div>

      <div className="event-categories">
        {categories.map(category => (
          <button
            key={category.value}
            className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <p>No events found. Create one to get started!</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <span className="event-category">{event.category}</span>
                <span className="event-date">{formatDate(event.date)}</span>
              </div>
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-footer">
                <span className="event-location">📍 {event.location}</span>
                <button 
                  className={`rsvp-btn ${event.event_attendees?.some(a => a.user_id === user.id) ? 'rsvped' : ''}`}
                  onClick={() => handleRSVP(event.id)}
                >
                  {event.event_attendees?.some(a => a.user_id === user.id) ? '✓ RSVPed' : 'RSVP'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Event</h3>
              <button onClick={() => setShowCreateEvent(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title..."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Describe your event..."
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Event location..."
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateEvent(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleCreateEvent} className="submit-btn">Create Event</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .event-calendar-page {
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%),
            url('/assets/Kenya-culture-guide-Nairobi.jpg') center/cover;
          border-radius: 16px;
          padding: 24px;
          margin: 16px;
          border: 2px solid rgba(255, 215, 0, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 600px;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .event-header h1 {
          color: #ffd700;
          font-size: 24px;
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
        }

        .create-event-btn {
          background: linear-gradient(135deg, #ffd700, #ffb700);
          border: none;
          color: #000;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .event-categories {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ccc;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .category-btn.active {
          background: linear-gradient(135deg, #ffd700, #ffb700);
          border-color: transparent;
          color: #000;
          font-weight: bold;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .no-events {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .event-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s;
        }

        .event-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .event-category {
          background: rgba(255, 215, 0, 0.2);
          color: #ffd700;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .event-date {
          color: #666;
          font-size: 11px;
        }

        .event-title {
          color: #fff;
          font-size: 16px;
          margin: 0 0 8px 0;
        }

        .event-description {
          color: #888;
          font-size: 13px;
          margin: 8px 0;
          line-height: 1.4;
        }

        .event-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .event-location {
          color: #666;
          font-size: 12px;
        }

        .rsvp-btn {
          background: linear-gradient(135deg, #ffd700, #ffb700);
          border: none;
          color: #000;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
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
          border: 2px solid #ffd700;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #ffd700;
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
        .form-group select,
        .form-group textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px;
          border-radius: 8px;
        }

        .form-group textarea {
          resize: vertical;
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
          background: linear-gradient(135deg, #ffd700, #ffb700);
          border: none;
          color: #000;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .event-calendar-page {
            padding: 16px;
            margin: 8px;
          }

          .event-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
