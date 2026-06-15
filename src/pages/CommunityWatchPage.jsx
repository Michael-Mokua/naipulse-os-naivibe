import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';

export default function CommunityWatchPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [watchGroups, setWatchGroups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', area: '' });
  const [newAlert, setNewAlert] = useState({ message: '', severity: 'low', area: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWatchGroups();
    loadAlerts();
  }, [isAuthenticated, navigate]);

  const loadWatchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('community_watch_groups')
        .select(`
          *,
          community_watch_group_members!inner(user_id)
        `)
        .eq('community_watch_group_members.user_id', user.id);

      if (error) throw error;
      setWatchGroups(data || []);
    } catch (error) {
      console.error('Error loading watch groups:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.area) return;

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('community_watch_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          area: newGroup.area,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const { error: memberError } = await supabase
        .from('community_watch_group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      setShowCreateGroup(false);
      setNewGroup({ name: '', description: '', area: '' });
      loadWatchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.message || !newAlert.area) return;

    try {
      const { error } = await supabase
        .from('community_alerts')
        .insert({
          user_id: user.id,
          message: newAlert.message,
          severity: newAlert.severity,
          area: newAlert.area
        });

      if (error) throw error;

      setShowCreateAlert(false);
      setNewAlert({ message: '', severity: 'low', area: '' });
      loadAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  return (
    <div className="community-watch-page">
      <div className="watch-header">
        <h1>👀 Community Watch</h1>
        <div className="header-actions">
          <button className="create-group-btn" onClick={() => setShowCreateGroup(true)}>
            ➕ New Group
          </button>
          <button className="create-alert-btn" onClick={() => setShowCreateAlert(true)}>
            🚨 Report Alert
          </button>
        </div>
      </div>

      <div className="watch-content">
        <div className="alerts-section">
          <h2>Recent Alerts</h2>
          {alerts.length === 0 ? (
            <p>No alerts yet. Report one to get started!</p>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="alert-card">
                <div className="alert-header">
                  <span className={`severity-badge ${alert.severity}`}>{alert.severity.toUpperCase()}</span>
                  <span className="alert-area">{alert.area}</span>
                </div>
                <p className="alert-message">{alert.message}</p>
              </div>
            ))
          )}
        </div>

        <div className="groups-section">
          <h2>Your Watch Groups</h2>
          {watchGroups.length === 0 ? (
            <p>No watch groups yet. Create one to get started!</p>
          ) : (
            watchGroups.map(group => (
              <div key={group.id} className="group-card">
                <h3 className="group-name">{group.name}</h3>
                <p className="group-description">{group.description}</p>
                <span className="group-area">📍 {group.area}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {showCreateGroup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Watch Group</h3>
              <button onClick={() => setShowCreateGroup(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  placeholder="e.g., Westlands Watch"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  placeholder="What's this group about?"
                />
              </div>
              <div className="form-group">
                <label>Area</label>
                <input
                  type="text"
                  value={newGroup.area}
                  onChange={(e) => setNewGroup({...newGroup, area: e.target.value})}
                  placeholder="e.g., Westlands"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateGroup(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleCreateGroup} className="submit-btn">Create Group</button>
            </div>
          </div>
        </div>
      )}

      {showCreateAlert && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report Alert</h3>
              <button onClick={() => setShowCreateAlert(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Severity</label>
                <select
                  value={newAlert.severity}
                  onChange={(e) => setNewAlert({...newAlert, severity: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                  placeholder="Describe the situation..."
                />
              </div>
              <div className="form-group">
                <label>Area</label>
                <input
                  type="text"
                  value={newAlert.area}
                  onChange={(e) => setNewAlert({...newAlert, area: e.target.value})}
                  placeholder="e.g., CBD"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateAlert(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleCreateAlert} className="submit-btn">Submit Alert</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .community-watch-page {
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%),
            url('/assets/Jomo_Kenyatta_Statue_and_KICC.jpg') center/cover;
          border-radius: 16px;
          padding: 24px;
          margin: 16px;
          border: 2px solid rgba(255, 59, 48, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 600px;
        }

        .watch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .watch-header h1 {
          color: #FF3B30;
          font-size: 24px;
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .create-group-btn,
        .create-alert-btn {
          background: linear-gradient(135deg, #FF3B30, #d63026);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .watch-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .alerts-section h2,
        .groups-section h2 {
          color: #fff;
          font-size: 18px;
          margin-bottom: 16px;
        }

        .alerts-list,
        .groups-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
        }

        .alert-card.severity-urgent {
          border-color: rgba(255, 59, 48, 0.5);
          background: rgba(255, 59, 48, 0.1);
        }

        .alert-card.severity-high {
          border-color: rgba(255, 149, 0, 0.5);
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .severity-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .severity-badge.low {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .severity-badge.medium {
          background: rgba(255, 149, 0, 0.2);
          color: #ff9500;
        }

        .severity-badge.high {
          background: rgba(255, 59, 48, 0.2);
          color: #FF3B30;
        }

        .severity-badge.urgent {
          background: rgba(255, 59, 48, 0.4);
          color: #fff;
        }

        .alert-time {
          color: #666;
          font-size: 11px;
        }

        .alert-message {
          color: #fff;
          font-size: 14px;
          margin: 8px 0;
        }

        .alert-area {
          color: #888;
          font-size: 12px;
        }

        .group-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
        }

        .group-name {
          color: #fff;
          font-size: 14px;
          margin: 0 0 8px 0;
        }

        .group-description {
          color: #888;
          font-size: 12px;
          margin: 8px 0;
        }

        .group-area {
          color: #666;
          font-size: 11px;
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
          border: 2px solid #FF3B30;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #FF3B30;
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
          background: linear-gradient(135deg, #FF3B30, #d63026);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .community-watch-page {
            padding: 16px;
            margin: 8px;
          }

          .watch-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .watch-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
