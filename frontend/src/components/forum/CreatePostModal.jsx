import React, { useState } from 'react';
import '../../styles/CreatePostModal.css';

export default function CreatePostModal({ onCreate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [anonymous, setAnonymous] = useState(false);

  return (
    <div className="create-post-container">
      <h4>Create a Post</h4>
      <div className="form-group">
        <input className="form-input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="form-group">
        <textarea className="form-textarea" placeholder="Share your thoughts" value={content} onChange={e => setContent(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="category-select">Category:</label>
        <select id="category-select" className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="general">General</option>
          <option value="anxiety">Anxiety</option>
          <option value="depression">Depression</option>
          <option value="stress">Stress</option>
          <option value="mindfulness">Mindfulness</option>
          <option value="self-care">Self-care</option>
        </select>
      </div>
      <div className="form-group form-checkbox">
        <input id="anonymous-check" type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
        <label htmlFor="anonymous-check">Post anonymously</label>
      </div>
      <button className="btn" onClick={() => onCreate({ title, content, category, anonymous })}>Post</button>
    </div>
  );
}