import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import PageFooter from '../components/PageFooter.jsx';
import { PAGE_IMAGES } from '../data/pageImages.js';

function alertBorderClass(severity) {
  if (severity === 'high' || severity === 'urgent') return 'danger';
  if (severity === 'medium') return 'caution';
  return 'info';
}

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
        .select(`*, community_watch_group_members!inner(user_id)`)
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
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      await supabase.from('community_watch_group_members').insert({
        group_id: groupData.id,
        user_id: user.id,
        role: 'admin',
      });

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
      const { error } = await supabase.from('community_alerts').insert({
        user_id: user.id,
        message: newAlert.message,
        severity: newAlert.severity,
        area: newAlert.area,
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
    <div className="page-watch">
      <div className="page-watch__panel scroll-reveal">
        <img className="city-image-load" src={PAGE_IMAGES.watch.src} alt={PAGE_IMAGES.watch.alt} />
        <div className="page-watch__panel-copy">
          <span className="page-watch__panel-date">JUNE 25, 2024</span>
          <p className="page-watch__panel-quote">The city watches. The city remembers.</p>
        </div>
      </div>

      <div className="np-page-header">
        <h1>Community Watch</h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="np-btn-primary" onClick={() => setShowCreateGroup(true)}>New Group</button>
          <button type="button" className="np-btn-cancel" onClick={() => setShowCreateAlert(true)}>Report Alert</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <section>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Recent Alerts</h2>
          {alerts.length === 0 ? (
            <p style={{ color: '#666' }}>No alerts yet.</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`page-watch__alert ${alertBorderClass(alert.severity)} scroll-reveal`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 'bold', letterSpacing: '0.08em' }}>{alert.severity.toUpperCase()}</span>
                  <span style={{ color: '#888', fontSize: 12 }}>{alert.area}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14 }}>{alert.message}</p>
              </div>
            ))
          )}
        </section>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Your Watch Groups</h2>
          {watchGroups.length === 0 ? (
            <p style={{ color: '#666' }}>No watch groups yet.</p>
          ) : (
            watchGroups.map((group) => (
              <div key={group.id} className="page-feed__card scroll-reveal" style={{ marginBottom: 12 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>{group.name}</h3>
                <p style={{ margin: '0 0 8px', color: '#888', fontSize: 13 }}>{group.description}</p>
                <span style={{ color: '#666', fontSize: 11 }}>📍 {group.area}</span>
              </div>
            ))
          )}
        </section>
      </div>

      <PageFooter />

      {showCreateGroup && (
        <div className="np-modal-overlay">
          <div className="np-modal">
            <div className="np-modal__header">
              <h3>Create Watch Group</h3>
              <button type="button" className="np-modal__close" onClick={() => setShowCreateGroup(false)}>×</button>
            </div>
            <div className="np-form-group">
              <label>Group Name</label>
              <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="e.g., Westlands Watch" />
            </div>
            <div className="np-form-group">
              <label>Description</label>
              <textarea value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Area</label>
              <input type="text" value={newGroup.area} onChange={(e) => setNewGroup({ ...newGroup, area: e.target.value })} placeholder="e.g., Westlands" />
            </div>
            <div className="np-modal__footer">
              <button type="button" className="np-btn-cancel" onClick={() => setShowCreateGroup(false)}>Cancel</button>
              <button type="button" className="np-btn-primary" onClick={handleCreateGroup}>Create Group</button>
            </div>
          </div>
        </div>
      )}

      {showCreateAlert && (
        <div className="np-modal-overlay">
          <div className="np-modal">
            <div className="np-modal__header">
              <h3>Report Alert</h3>
              <button type="button" className="np-modal__close" onClick={() => setShowCreateAlert(false)}>×</button>
            </div>
            <div className="np-form-group">
              <label>Severity</label>
              <select value={newAlert.severity} onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="np-form-group">
              <label>Message</label>
              <textarea value={newAlert.message} onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })} placeholder="Describe the situation..." />
            </div>
            <div className="np-form-group">
              <label>Area</label>
              <input type="text" value={newAlert.area} onChange={(e) => setNewAlert({ ...newAlert, area: e.target.value })} placeholder="e.g., CBD" />
            </div>
            <div className="np-modal__footer">
              <button type="button" className="np-btn-cancel" onClick={() => setShowCreateAlert(false)}>Cancel</button>
              <button type="button" className="np-btn-primary" onClick={handleCreateAlert}>Submit Alert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
