import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', type: 'group', description: '' });
  const messagesEndRef = useRef(null);

  const roomTypes = [
    { value: 'direct', label: 'Direct Message', icon: '💬' },
    { value: 'group', label: 'Group Chat', icon: '👥' },
    { value: 'carpool', label: 'Carpool Chat', icon: '🚗' },
    { value: 'lost_found', label: 'Lost & Found Chat', icon: '🔍' },
    { value: 'community_watch', label: 'Community Watch', icon: '👀' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadChatRooms();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members!inner(user_id)
        `)
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
        .select(`
          *,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Set up real-time subscription for messages
      const channel = supabase
        .channel(`messages:${roomId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
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
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: activeRoom.id,
          user_id: user.id,
          message: newMessage,
          message_type: 'text'
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
          created_by: user.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { error: memberError } = await supabase
        .from('chat_room_members')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      setShowCreateRoom(false);
      setNewRoom({ name: '', type: 'group', description: '' });
      loadChatRooms();
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const getRoomIcon = (type) => {
    const roomType = roomTypes.find(t => t.value === type);
    return roomType ? roomType.icon : '💬';
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>💬 Chat</h1>
        <button className="create-room-btn" onClick={() => setShowCreateRoom(true)}>
          ➕ New Chat
        </button>
      </div>

      <div className="chat-layout">
        {!activeRoom ? (
          <div className="chat-rooms-list">
            {chatRooms.length === 0 ? (
              <div className="no-rooms">
                <p>No chat rooms yet. Create one to get started!</p>
              </div>
            ) : (
              chatRooms.map(room => (
                <div key={room.id} className="room-card" onClick={() => handleRoomClick(room)}>
                  <div className="room-header">
                    <span className="room-icon">{getRoomIcon(room.type)}</span>
                    <span className="room-type">{room.type}</span>
                  </div>
                  <h3 className="room-name">{room.name}</h3>
                  {room.description && <p className="room-description">{room.description}</p>}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="chat-view">
            <div className="chat-view-header">
              <button className="back-btn" onClick={() => setActiveRoom(null)}>
                ← Back
              </button>
              <div className="active-room-info">
                <span className="room-icon">{getRoomIcon(activeRoom.type)}</span>
                <h3 className="room-name">{activeRoom.name}</h3>
              </div>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`message ${message.user_id === user.id ? 'sent' : 'received'}`}>
                    <div className="message-avatar">
                      {message.profiles?.avatar_url ? (
                        <img src={message.profiles.avatar_url} alt="Avatar" />
                      ) : (
                        <span>{message.profiles?.full_name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div className="message-content">
                      <span className="message-sender">{message.profiles?.full_name || 'Anonymous'}</span>
                      <p className="message-text">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input">
              <input
                type="text"
                className="message-input-field"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button className="send-btn" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Chat Room</h3>
              <button onClick={() => setShowCreateRoom(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Room Type</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                >
                  {roomTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Enter room name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="What's this room about?"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateRoom(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleCreateRoom} className="submit-btn">Create</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chat-page {
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%),
            url('/assets/nairobi_transport.jpg') center/cover;
          border-radius: 16px;
          padding: 24px;
          margin: 16px;
          border: 2px solid rgba(147, 112, 219, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chat-header h1 {
          color: #9370db;
          font-size: 24px;
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
        }

        .create-room-btn {
          background: linear-gradient(135deg, #9370db, #8a2be2);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .chat-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-rooms-list {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          overflow-y: auto;
        }

        .no-rooms {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .room-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .room-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(147, 112, 219, 0.3);
        }

        .room-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .room-type {
          background: rgba(147, 112, 219, 0.2);
          color: #9370db;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .room-name {
          color: #fff;
          font-size: 14px;
          margin: 0 0 8px 0;
        }

        .room-description {
          color: #888;
          font-size: 12px;
          margin: 0;
        }

        .chat-view {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .active-room-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .room-icon {
          font-size: 20px;
        }

        .active-room-info .room-name {
          color: #9370db;
          font-size: 18px;
          margin: 0;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
        }

        .no-messages {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .message.sent {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #9370db, #8a2be2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .message-content {
          max-width: 70%;
        }

        .message-sender {
          color: #9370db;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 4px;
          display: block;
        }

        .message.sent .message-sender {
          color: #666;
          text-align: right;
        }

        .message-text {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 10px 14px;
          border-radius: 12px;
          margin: 0;
          line-height: 1.4;
        }

        .message.sent .message-text {
          background: linear-gradient(135deg, #9370db, #8a2be2);
          border: none;
        }

        .message-input {
          display: flex;
          gap: 8px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          margin-top: 16px;
        }

        .message-input-field {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 10px 14px;
          border-radius: 8px;
        }

        .message-input-field:focus {
          outline: none;
          border-color: #9370db;
        }

        .send-btn {
          background: linear-gradient(135deg, #9370db, #8a2be2);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .chat-page {
            padding: 16px;
            margin: 8px;
          }

          .chat-rooms-list {
            grid-template-columns: 1fr;
          }
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
          max-width: 500px;
          width: 90%;
          border: 2px solid #9370db;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #9370db;
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

        .form-group select,
        .form-group input,
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
          background: linear-gradient(135deg, #9370db, #8a2be2);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
