import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';

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
    photo_url: ''
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
    { value: 'other', label: 'Other' }
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

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filePath);

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
      const { error } = await supabase
        .from('lost_found_items')
        .insert({
          user_id: user.id,
          title: newItem.title,
          description: newItem.description,
          category: newItem.category,
          location: newItem.location,
          type: newItem.type,
          photo_url: newItem.photo_url
        });

      if (error) throw error;

      setShowReportItem(false);
      setNewItem({
        title: '',
        description: '',
        category: 'electronics',
        location: '',
        type: 'lost',
        photo_url: ''
      });
      loadItems();
    } catch (error) {
      console.error('Error reporting item:', error);
    }
  };

  const handleClaimItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('lost_found_items')
        .update({ status: 'claimed' })
        .eq('id', itemId);

      if (error) throw error;
      loadItems();
    } catch (error) {
      console.error('Error claiming item:', error);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

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
    <div className="lost-found-page">
      <div className="lf-header">
        <h1>🔍 Lost & Found</h1>
        <button className="report-btn" onClick={() => setShowReportItem(true)}>
          ➕ Report Item
        </button>
      </div>

      <div className="lf-categories">
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

      <div className="items-grid">
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items found. Report one to get started!</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className={`item-card type-${item.type}`}>
              <div className="item-header">
                <span className={`type-badge ${item.type}`}>
                  {item.type === 'lost' ? '🔴 LOST' : '🟢 FOUND'}
                </span>
                <span className="item-time">{formatTime(item.created_at)}</span>
              </div>
              
              {item.photo_url && (
                <div className="item-photo">
                  <img src={item.photo_url} alt={item.title} />
                </div>
              )}

              <h3 className="item-title">{item.title}</h3>
              <p className="item-description">{item.description}</p>
              
              <div className="item-details">
                <span className="item-category">{item.category}</span>
                <span className="item-location">📍 {item.location}</span>
              </div>

              {item.status === 'open' && (
                <button className="claim-btn" onClick={() => handleClaimItem(item.id)}>
                  Claim Item
                </button>
              )}

              {item.status === 'claimed' && (
                <span className="claimed-badge">Claimed</span>
              )}
            </div>
          ))
        )}
      </div>

      {showReportItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report Item</h3>
              <button onClick={() => setShowReportItem(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                >
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  placeholder="Item title..."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Describe the item..."
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                >
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  placeholder="Where was it lost/found?"
                />
              </div>
              <div className="form-group">
                <label>Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e.target.files[0])}
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto && <span className="uploading-text">Uploading...</span>}
                {newItem.photo_url && (
                  <div className="photo-preview">
                    <img src={newItem.photo_url} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowReportItem(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleReportItem} className="submit-btn">Submit</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .lost-found-page {
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%),
            url('/assets/nairobi scenic night view.png') center/cover;
          border-radius: 16px;
          padding: 24px;
          margin: 16px;
          border: 2px solid rgba(0, 122, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 600px;
        }

        .lf-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .lf-header h1 {
          color: #007AFF;
          font-size: 24px;
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
        }

        .report-btn {
          background: linear-gradient(135deg, #007AFF, #0056b3);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .lf-categories {
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
          background: linear-gradient(135deg, #007AFF, #0056b3);
          border-color: transparent;
          color: white;
          font-weight: bold;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .no-items {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .item-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s;
        }

        .item-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 122, 255, 0.3);
        }

        .item-card.type-lost {
          border-left: 3px solid #FF3B30;
        }

        .item-card.type-found {
          border-left: 3px solid #34C759;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .type-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .type-badge.lost {
          background: rgba(255, 59, 48, 0.2);
          color: #FF3B30;
        }

        .type-badge.found {
          background: rgba(52, 199, 89, 0.2);
          color: #34C759;
        }

        .item-time {
          color: #666;
          font-size: 11px;
        }

        .item-photo {
          width: 100%;
          height: 150px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          margin-bottom: 12px;
          overflow: hidden;
        }

        .item-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-title {
          color: #fff;
          font-size: 16px;
          margin: 0 0 8px 0;
        }

        .item-description {
          color: #888;
          font-size: 13px;
          margin: 8px 0;
          line-height: 1.4;
        }

        .item-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .item-category {
          background: rgba(0, 122, 255, 0.2);
          color: #007AFF;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
        }

        .item-location {
          color: #666;
          font-size: 11px;
        }

        .claim-btn {
          background: linear-gradient(135deg, #007AFF, #0056b3);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          margin-top: 12px;
          width: 100%;
        }

        .claimed-badge {
          display: block;
          background: rgba(52, 199, 89, 0.2);
          color: #34C759;
          padding: 6px 12px;
          border-radius: 6px;
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          margin-top: 12px;
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
          border: 2px solid #007AFF;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #007AFF;
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

        .uploading-text {
          color: #007AFF;
          font-size: 12px;
          margin-top: 4px;
        }

        .photo-preview {
          margin-top: 8px;
          width: 100%;
          height: 150px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
        }

        .photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          background: linear-gradient(135deg, #007AFF, #0056b3);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .lost-found-page {
            padding: 16px;
            margin: 8px;
          }

          .lf-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .items-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
