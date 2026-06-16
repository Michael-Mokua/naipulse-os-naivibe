import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import PageFooter from '../components/PageFooter.jsx';
import { PAGE_IMAGES } from '../data/pageImages.js';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', type: 'group', description: '' });
  const [stripTime, setStripTime] = useState('23:00');
  const messagesEndRef = useRef(null);

  const roomTypes = [
    { value: 'direct', label: 'Direct Message', icon: '💬' },
    { value: 'group', label: 'Group Chat', icon: '👥' },
    { value: 'carpool', label: 'Carpool Chat', icon: '🚗' },
    { value: 'lost_found', label: 'Lost & Found Chat', icon: '🔍' },
    { value: 'community_watch', label: 'Community Watch', icon: '👀' },
  ];

  useEffect(() => {
    setStripTime(new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadChatRooms();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`*, chat_room_members!inner(user_id)`)
        .eq('chat_room_members.user_id', user.id);

      if (error) throw error;
      setChatRooms(data || []);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`*, profiles:user_id(full_name, avatar_url)`)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      const channel = supabase
        .channel(`messages:${roomId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleRoomClick = (room) => {
    setActiveRoom(room);
    loadMessages(room.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;

    try {
      const { error } = await supabase.from('messages').insert({
        room_id: activeRoom.id,
        user_id: user.id,
        message: newMessage,
        message_type: 'text',
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: newRoom.name,
          description: newRoom.description,
          type: newRoom.type,
          created_by: user.id,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { error: memberError } = await supabase.from('chat_room_members').insert({
        room_id: roomData.id,
        user_id: user.id,
        role: 'admin',
      });

      if (memberError) throw memberError;

      setShowCreateRoom(false);
      setNewRoom({ name: '', type: 'group', description: '' });
      loadChatRooms();
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const getRoomIcon = (type) => roomTypes.find((t) => t.value === type)?.icon || '💬';

  return (
    <div className="page-chat">
      <aside className="page-chat__strip">
        <img className="city-image-load" src={PAGE_IMAGES.chat.src} alt={PAGE_IMAGES.chat.alt} />
        <span className="page-chat__strip-label">WESTLANDS · {stripTime}</span>
      </aside>

      <div className="page-chat__main">
        <div className="np-page-header">
          <h1>Chat</h1>
          <button type="button" className="np-btn-primary" onClick={() => setShowCreateRoom(true)}>
            New Chat
          </button>
        </div>

        {!activeRoom ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, flex: 1 }}>
            {chatRooms.length === 0 ? (
              <p style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
                No chat rooms yet. Create one to get started!
              </p>
            ) : (
              chatRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className="page-feed__card scroll-reveal city-image-hover"
                  style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  onClick={() => handleRoomClick(room)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>{getRoomIcon(room.type)}</span>
                    <span style={{ fontSize: 10, color: '#7B2FFF', fontWeight: 'bold' }}>{room.type}</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{room.name}</h3>
                  {room.description && <p style={{ margin: 0, color: '#888', fontSize: 12 }}>{room.description}</p>}
                </button>
              ))
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <button type="button" className="np-btn-cancel" style={{ flex: 'none' }} onClick={() => setActiveRoom(null)}>
                ← Back
              </button>
              <span>{getRoomIcon(activeRoom.type)}</span>
              <h3 style={{ margin: 0, color: '#7B2FFF' }}>{activeRoom.name}</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>No messages yet.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      flexDirection: message.user_id === user.id ? 'row-reverse' : 'row',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7B2FFF, #FF2D78)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        flexShrink: 0,
                      }}
                    >
                      {message.profiles?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div style={{ maxWidth: '70%' }}>
                      <span style={{ fontSize: 12, color: '#7B2FFF', fontWeight: 'bold' }}>
                        {message.profiles?.full_name || 'Anonymous'}
                      </span>
                      <p
                        style={{
                          margin: '4px 0 0',
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: message.user_id === user.id ? 'linear-gradient(135deg, #7B2FFF, #FF2D78)' : 'rgba(255,255,255,0.05)',
                          border: message.user_id === user.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input
                type="text"
                className="np-form-group"
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: 8 }}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button type="button" className="np-btn-primary" style={{ flex: 'none' }} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        )}

        <PageFooter />
      </div>

      {showCreateRoom && (
        <div className="np-modal-overlay">
          <div className="np-modal">
            <div className="np-modal__header">
              <h3>Create Chat Room</h3>
              <button type="button" className="np-modal__close" onClick={() => setShowCreateRoom(false)}>×</button>
            </div>
            <div className="np-form-group">
              <label>Room Type</label>
              <select value={newRoom.type} onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}>
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="np-form-group">
              <label>Room Name</label>
              <input type="text" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} placeholder="Enter room name" />
            </div>
            <div className="np-form-group">
              <label>Description</label>
              <textarea value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} rows={3} />
            </div>
            <div className="np-modal__footer">
              <button type="button" className="np-btn-cancel" onClick={() => setShowCreateRoom(false)}>Cancel</button>
              <button type="button" className="np-btn-primary" onClick={handleCreateRoom}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
