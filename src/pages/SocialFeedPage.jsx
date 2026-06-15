import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';

export default function SocialFeedPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('general');
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPosts();
    setupRealtimeSubscription();
  }, [isAuthenticated, navigate]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
        setPosts([]);
        return;
      }
      
      // Load likes and comments separately to avoid complex joins
      const postsWithInteractions = await Promise.all(
        (data || []).map(async (post) => {
          const [likesData, commentsData] = await Promise.all([
            supabase.from('post_likes').select('*').eq('post_id', post.id),
            supabase.from('post_comments').select('*, profiles:user_id(full_name)').eq('post_id', post.id)
          ]);
          
          return {
            ...post,
            post_likes: likesData.data || [],
            post_comments: commentsData.data || []
          };
        })
      );
      
      setPosts(postsWithInteractions);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('social_posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_posts' }, (payload) => {
        loadPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content: newPost,
          post_type: postType
        });

      if (error) throw error;

      setShowCreatePost(false);
      setNewPost('');
      setPostType('general');
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    if (!comment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: comment
        });

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="social-feed-page">
      {/* Cinematic filmstrip at top */}
      <div className="filmstrip-container">
        <div className="filmstrip-image">
          <img src="/assets/nganya_graffiti.jpg" alt="Nairobi Live" />
          <div className="filmstrip-overlay"></div>
        </div>
        <div className="filmstrip-content">
          <div className="live-tag">[ NAIROBI LIVE ]</div>
          <div className="live-timestamp">● {new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })} EAT</div>
        </div>
      </div>

      <div className="feed-header">
        <h1>📱 Nairobi Social Feed</h1>
        <button className="create-post-btn" onClick={() => setShowCreatePost(true)}>
          ➕ New Post
        </button>
      </div>

      <div className="feed-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="Avatar" />
                    ) : (
                      <span>{post.profiles?.full_name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{post.profiles?.full_name || 'Anonymous'}</span>
                    <span className="post-time">{formatTime(post.created_at)}</span>
                  </div>
                </div>
                {post.post_type === 'emergency' && (
                  <span className="emergency-badge">🚨 Emergency</span>
                )}
              </div>

              <div className="post-content">
                <p>{post.content}</p>
              </div>

              <div className="post-actions">
                <button className="action-btn" onClick={() => handleLike(post.id)}>
                  ❤️ {post.post_likes?.length || 0}
                </button>
                <button className="action-btn">
                  💬 {post.post_comments?.length || 0}
                </button>
                <button className="action-btn">🔗 Share</button>
              </div>

              {post.post_comments && post.post_comments.length > 0 && (
                <div className="post-comments">
                  {post.post_comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <span className="comment-author">{comment.profiles?.full_name || 'Anonymous'}:</span>
                      <span className="comment-content">{comment.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreatePost && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Post</h3>
              <button onClick={() => setShowCreatePost(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Post Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="emergency">🚨 Emergency</option>
                  <option value="protest">📢 Protest/Alert</option>
                  <option value="community">👥 Community</option>
                </select>
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's happening in Nairobi?"
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreatePost(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleCreatePost} className="submit-btn">Post</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .social-feed-page {
          background: #080808;
          border-radius: 16px;
          padding: 0;
          margin: 16px;
          border: none;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .filmstrip-container {
          position: relative;
          width: 100%;
          height: 280px;
          overflow: hidden;
        }

        .filmstrip-image {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .filmstrip-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          animation: kenBurns 8s ease-in-out infinite;
        }

        @keyframes kenBurns {
          0%, 100% { transform: scale(1.0); }
          50% { transform: scale(1.04); }
        }

        .filmstrip-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to bottom, transparent 60%, #080808 100%);
        }

        .filmstrip-content {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
        }

        .live-tag {
          font-family: 'Courier New', monospace;
          color: #00FF88;
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 0.1em;
        }

        .live-timestamp {
          font-family: 'Courier New', monospace;
          color: #00FF88;
          font-size: 12px;
          font-weight: bold;
        }

        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #080808;
        }

        .feed-header h1 {
          color: #fff;
          font-size: 24px;
          margin: 0;
          font-family: 'Bebas Neue', sans-serif;
        }

        .create-post-btn {
          background: linear-gradient(135deg, #7B2FFF, #FF2D78);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .feed-container {
          flex: 1;
          padding: 0 24px 24px;
          overflow-y: auto;
          background: #080808;
        }

        .no-posts {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .post-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          transition: all 0.3s;
        }

        .post-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(123, 42, 255, 0.3);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .post-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #7B2FFF, #FF2D78);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          overflow: hidden;
        }

        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          color: #fff;
          font-size: 14px;
          font-weight: bold;
        }

        .post-time {
          color: #666;
          font-size: 12px;
        }

        .emergency-badge {
          background: rgba(255, 45, 120, 0.2);
          color: #FF2D78;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }

        .post-content {
          margin-bottom: 12px;
        }

        .post-content p {
          color: #fff;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .post-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ccc;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #00FF88;
        }

        .post-comments {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 12px;
        }

        .comment {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .comment-author {
          color: #7B2FFF;
          font-weight: bold;
        }

        .comment-content {
          color: #ccc;
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
          background: #080808;
          padding: 24px;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          border: 2px solid #7B2FFF;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #7B2FFF;
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
          background: linear-gradient(135deg, #7B2FFF, #FF2D78);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .social-feed-page {
            padding: 0;
            margin: 0;
            border-radius: 0;
          }

          .filmstrip-container {
            height: 200px;
          }

          .feed-header {
            padding: 16px;
          }

          .feed-container {
            padding: 0 16px 16px;
          }
        }
      `}</style>
    </div>
  );
}

        .create-post-btn {
          background: linear-gradient(135deg, #1DA1F2, #0d8ddb);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }

        .create-post-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(29, 161, 242, 0.4);
        }

        .feed-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
        }

        .no-posts {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .post-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s;
        }

        .post-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(29, 161, 242, 0.3);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .post-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1DA1F2, #0d8ddb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          overflow: hidden;
        }

        .author-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          color: #fff;
          font-size: 14px;
          font-weight: bold;
        }

        .post-time {
          color: #666;
          font-size: 12px;
        }

        .emergency-badge {
          background: rgba(255, 59, 48, 0.2);
          color: #FF3B30;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
        }

        .post-content {
          margin-bottom: 12px;
        }

        .post-content p {
          color: #fff;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .post-actions {
          display: flex;
          gap: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .action-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s;
        }

        .action-btn:hover {
          color: #1DA1F2;
        }

        .post-comments {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comment {
          display: flex;
          gap: 8px;
          font-size: 12px;
        }

        .comment-author {
          color: #1DA1F2;
          font-weight: bold;
        }

        .comment-content {
          color: #888;
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
          border: 2px solid #1DA1F2;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          color: #1DA1F2;
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
          background: linear-gradient(135deg, #1DA1F2, #0d8ddb);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .social-feed-page {
            padding: 16px;
            margin: 8px;
          }

          .feed-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
