import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { supabase } from '../supabase/client.js';
import PageFooter from '../components/PageFooter.jsx';
import { PAGE_IMAGES } from '../data/pageImages.js';

export default function SocialFeedPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('general');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [eatTime, setEatTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setEatTime(
        new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

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

      const postsWithInteractions = await Promise.all(
        (data || []).map(async (post) => {
          const [likesData, commentsData] = await Promise.all([
            supabase.from('post_likes').select('*').eq('post_id', post.id),
            supabase.from('post_comments').select('*, profiles:user_id(full_name)').eq('post_id', post.id),
          ]);

          return {
            ...post,
            post_likes: likesData.data || [],
            post_comments: commentsData.data || [],
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'social_posts' }, () => {
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
      const { error } = await supabase.from('social_posts').insert({
        user_id: user.id,
        content: newPost,
        post_type: postType,
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
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }

      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
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
    <div className="page-feed">
      <div className="page-feed__filmstrip">
        <div className="page-feed__filmstrip-inner">
          <img
            className="city-image-load"
            src={PAGE_IMAGES.feed.src}
            alt={PAGE_IMAGES.feed.alt}
          />
        </div>
        <div className="page-feed__filmstrip-gradient" />
        <div className="page-feed__filmstrip-meta">
          <span>[ NAIROBI LIVE ]</span>
          <span>● {eatTime || '—:—'} EAT</span>
        </div>
      </div>

      <div className="page-feed__body">
        <div className="page-feed__header">
          <h1>City Feed</h1>
          <button type="button" className="np-btn-primary" onClick={() => setShowCreatePost(true)}>
            New Post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="page-feed__card scroll-reveal">
            <p style={{ color: '#666', margin: 0, textAlign: 'center' }}>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="page-feed__card scroll-reveal">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7B2FFF, #FF2D78)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      overflow: 'hidden',
                    }}
                  >
                    {post.profiles?.avatar_url ? (
                      <img src={post.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      post.profiles?.full_name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: 14 }}>{post.profiles?.full_name || 'Anonymous'}</div>
                    <div style={{ color: '#666', fontSize: 12 }}>{formatTime(post.created_at)}</div>
                  </div>
                </div>
                {post.post_type === 'emergency' && (
                  <span style={{ color: '#FF2D78', fontSize: 10, fontWeight: 'bold' }}>EMERGENCY</span>
                )}
              </div>
              <p style={{ margin: '0 0 12px', lineHeight: 1.5 }}>{post.content}</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="np-btn-cancel" style={{ flex: 'none', padding: '6px 12px' }} onClick={() => handleLike(post.id)}>
                  ♥ {post.post_likes?.length || 0}
                </button>
                <button type="button" className="np-btn-cancel" style={{ flex: 'none', padding: '6px 12px' }}>
                  💬 {post.post_comments?.length || 0}
                </button>
              </div>
              {post.post_comments?.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {post.post_comments.map((comment) => (
                    <div key={comment.id} style={{ fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#7B2FFF', fontWeight: 'bold' }}>{comment.profiles?.full_name || 'Anonymous'}: </span>
                      <span style={{ color: '#ccc' }}>{comment.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}

        <PageFooter />
      </div>

      {showCreatePost && (
        <div className="np-modal-overlay">
          <div className="np-modal">
            <div className="np-modal__header">
              <h3>Create Post</h3>
              <button type="button" className="np-modal__close" onClick={() => setShowCreatePost(false)}>×</button>
            </div>
            <div className="np-form-group">
              <label>Post Type</label>
              <select value={postType} onChange={(e) => setPostType(e.target.value)}>
                <option value="general">General</option>
                <option value="emergency">Emergency</option>
                <option value="protest">Protest / Alert</option>
                <option value="community">Community</option>
              </select>
            </div>
            <div className="np-form-group">
              <label>Content</label>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening in Nairobi?"
                rows={4}
              />
            </div>
            <div className="np-modal__footer">
              <button type="button" className="np-btn-cancel" onClick={() => setShowCreatePost(false)}>Cancel</button>
              <button type="button" className="np-btn-primary" onClick={handleCreatePost}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
