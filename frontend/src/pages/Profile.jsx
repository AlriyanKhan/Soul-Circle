import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      if (user) {
        try {
          const postsRes = await api.get('/api/user/posts');
          const repliesRes = await api.get('/api/user/replies');
          setPosts(postsRes.data.posts);
          setReplies(repliesRes.data.replies);
        } catch (error) {
          console.error("Failed to fetch user activity:", error);
          setPosts([]);
          setReplies([]);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchActivity();
  }, [user]);

  if (!user) return <p>Loading...</p>;

  const renderContent = () => {
    if (loading) return <p>Loading activity...</p>;

    if (tab === 'posts') {
      return posts.length > 0 ? (
        <div className="activity-list">
          {posts.map(post => (
            <div key={post.id} className="activity-item">
              <div className="activity-item-content">
                <Link to={`/posts/${post.id}`} className="post-title-link">{post.title}</Link>
              </div>
              <Link to={`/posts/${post.id}`} className="view-post-link">View Post →</Link>
            </div>
          ))}
        </div>
      ) : <p>You haven't made any posts yet.</p>;
    }

    if (tab === 'replies') {
      return replies.length > 0 ? (
        <div className="activity-list">
          {replies.map(reply => (
            <div key={reply.id} className="activity-item">
              <div className="activity-item-content">
                <p className="reply-context">{reply.content}</p>
              </div>
              <Link to={`/posts/${reply.postId}`} className="view-post-link">View full post →</Link>
            </div>
          ))}
        </div>
      ) : <p>You haven't replied to any posts yet.</p>;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <div className="user-details">
          <p><b>Name:</b> {user.name || '—'}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
        </div>
      </div>

      <div className="profile-metrics">
        <div className="metric-card">
          <p className="metric-value">{loading ? '...' : posts.length}</p>
          <p className="metric-label">Posts Created</p>
        </div>
        <div className="metric-card">
          <p className="metric-value">{loading ? '...' : replies.length}</p>
          <p className="metric-label">Replies Made</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-button ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
          My Posts
        </button>
        <button className={`tab-button ${tab === 'replies' ? 'active' : ''}`} onClick={() => setTab('replies')}>
          My Replies
        </button>
      </div>

      <div className="profile-content">
        {renderContent()}
      </div>
    </div>
  );
}