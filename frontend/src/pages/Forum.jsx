import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from '../components/forum/CreatePostModal';
import CategoryFilter from '../components/forum/CategoryFilter';
import PostCard from '../components/forum/PostCard';
import '../styles/Forum.css';

export default function Forum() {
  const [categories, setCategories] = useState([]);
  const [current, setCurrent] = useState('');
  const [posts, setPosts] = useState([]);
  const { token } = useAuth();

  async function load() {
    const cats = await api.get('/api/forum/categories');
    setCategories(cats.data.categories);
    const list = await api.get('/api/forum/posts', { params: { category: current || undefined } });
    setPosts(list.data.posts);
  }

  useEffect(() => { load() }, [current]);

  async function createPost({ title, content, category, anonymous }) {
    await api.post('/api/forum/posts', { title, content, category, anonymous });
    load();
  }
  async function like(id) { await api.post(`/api/forum/posts/${id}/like`); load(); }
  async function upvote(id) { await api.post(`/api/forum/posts/${id}/upvote`); load(); }
  async function report(id) { await api.post(`/api/forum/posts/${id}/report`, { reason: 'inappropriate' }); load(); }

  return (
    <div className="forum-container">
      <h2>Community Support Forum</h2>
      <div className="forum-header">
        <CategoryFilter categories={categories} value={current} onChange={setCurrent} />
        {token && <CreatePostModal onCreate={createPost} />}
      </div>
      <div className="post-feed">
        {posts.map(p => (
          <PostCard key={p.id} post={p} onLike={like} onUpvote={upvote} onReport={report} />
        ))}
      </div>
    </div>
  );
}