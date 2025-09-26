import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/PostCard.css';

export default function PostCard({ post }) {
  const authorLabel = post.anonymous ? 'Anonymous' : (post.authorName || 'Member');

  // These functions would be passed as props if they need to trigger a list refresh
  const onLike = (id) => console.log('Liking post', id);
  const onUpvote = (id) => console.log('Upvoting post', id);
  const onReport = (id) => console.log('Reporting post', id);

  return (
    <div className="post-card">
      <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
      <div className="post-meta">
        <small>By: {authorLabel}</small>
        <small>Category: {post.category}</small>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button className="btn-action" onClick={() => onLike(post.id)}>Like ({post.likes || 0})</button>
        <button className="btn-action" onClick={() => onUpvote(post.id)}>Support ({post.upvotes || 0})</button>
        <button className="btn-action" onClick={() => onReport(post.id)}>Report</button>
        <Link className="reply-link" to={`/posts/${post.id}`}>Reply</Link>
        {post.flagged && <span className="flagged-status">Flagged</span>}
      </div>
    </div>
  );
}