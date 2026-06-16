import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import PageFooter from '../components/PageFooter.jsx';
import { PAGE_IMAGES } from '../data/pageImages.js';

export default function LostAndFoundPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showReportItem, setShowReportItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'electronics',
    location: '',
    type: 'lost',
    photo_url: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'documents', label: 'Documents' },
    { value: 'keys', label: 'Keys' },
    { value: 'wallets', label: 'Wallets/Purses' },
    { value: 'pets', label: 'Pets' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadItems();
  }, [isAuthenticated, navigate]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_found_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading items:', error);
        setItems([]);
        return;
      }
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('item-photos').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('item-photos').getPublicUrl(filePath);
      setNewItem({ ...newItem, photo_url: publicUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleReportItem = async () => {
    if (!newItem.title || !newItem.location) return;

    try {
      const { error } = await supabase.from('lost_found_items').insert({
        user_id: user.id,
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        location: newItem.location,
        type: newItem.type,
        photo_url: newItem.photo_url,
      });

      if (error) throw error;

      setShowReportItem(false);
      setNewItem({ title: '', description: '', category: 'electronics', location: '', type: 'lost', photo_url: '' });
      loadItems();
    } catch (error) {
      console.error('Error reporting item:', error);
    }
  };

  const handleClaimItem = async (itemId) => {
    try {
      const { error } = await supabase.from('lost_found_items').update({ status: 'claimed' }).eq('id', itemId);
      if (error) throw error;
      loadItems();
    } catch (error) {
      console.error('Error claiming item:', error);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-lostfound">
      <div className="page-lostfound__pin-board">
        <figure className="page-lostfound__polaroid city-image-hover">
          <span className="page-lostfound__pin" aria-hidden>📌</span>
          <img className="city-image-load" src={PAGE_IMAGES.lostFound.src} alt={PAGE_IMAGES.lostFound.alt} />
          <figcaption className="page-lostfound__polaroid-caption">{PAGE_IMAGES.lostFound.caption}</figcaption>
        </figure>
      </div>

      <div className="np-page-header">
        <h1>Lost & Found</h1>
        <button type="button" className="np-btn-primary" onClick={() => setShowReportItem(true)}>
          Report Item
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
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

      <div className="page-lostfound__notes-grid">
        {filteredItems.length === 0 ? (
          <p style={{ color: '#8a7a62', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>No items found.</p>
        ) : (
          filteredItems.map((item) => (
            <article key={item.id} className="page-lostfound__note scroll-reveal">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 'bold', fontSize: 11, color: item.type === 'lost' ? '#c0392b' : '#27ae60' }}>
                  {item.type === 'lost' ? 'LOST' : 'FOUND'}
                </span>
                <span style={{ fontSize: 11, color: '#8a7a62' }}>{formatTime(item.created_at)}</span>
              </div>
              {item.photo_url && (
                <img src={item.photo_url} alt={item.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />
              )}
              <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{item.title}</h3>
              <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.4 }}>{item.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a7a62' }}>
                <span>{item.category}</span>
                <span>📍 {item.location}</span>
              </div>
              {item.status === 'open' && (
                <button type="button" className="np-btn-primary" style={{ width: '100%', marginTop: 12, fontSize: 12 }} onClick={() => handleClaimItem(item.id)}>
                  Claim Item
                </button>
              )}
              {item.status === 'claimed' && (
                <span style={{ display: 'block', marginTop: 12, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#27ae60' }}>Claimed</span>
              )}
            </article>
          ))
        )}
      </div>

      <PageFooter />

      {showReportItem && (
        <div className="np-modal-overlay">
          <div className="np-modal">
            <div className="np-modal__header">
              <h3>Report Item</h3>
              <button type="button" className="np-modal__close" onClick={() => setShowReportItem(false)}>×</button>
            </div>
            <div className="np-form-group">
              <label>Type</label>
              <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div className="np-form-group">
              <label>Title</label>
              <input type="text" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Description</label>
              <textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Category</label>
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                {categories.filter((c) => c.value !== 'all').map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="np-form-group">
              <label>Location</label>
              <input type="text" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />
            </div>
            <div className="np-form-group">
              <label>Photo (optional)</label>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e.target.files[0])} disabled={uploadingPhoto} />
            </div>
            <div className="np-modal__footer">
              <button type="button" className="np-btn-cancel" onClick={() => setShowReportItem(false)}>Cancel</button>
              <button type="button" className="np-btn-primary" onClick={handleReportItem}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
