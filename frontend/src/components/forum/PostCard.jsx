import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/PostCard.css';

// The functions onLike, onUpvote, and onReport are now correctly received from props
export default function PostCard({ post, onLike, onUpvote, onReport }) {
  const authorLabel = post.anonymous ? 'Anonymous' : (post.authorName || 'Member');

  // The local dummy functions that were causing the bug have been removed.

  return (
    <div className="post-card">
      <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
      <div className="post-meta">
        <small>By: {authorLabel}</small>
        <small>Category: {post.category}</small>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        {/* These buttons now call the functions passed down from the parent Forum component */}
        <button className="btn-action" onClick={() => onLike(post.id)}>Like ({post.likes || 0})</button>
        <button className="btn-action" onClick={() => onUpvote(post.id)}>Support ({post.upvotes || 0})</button>
        <button className="btn-action" onClick={() => onReport(post.id)}>Report</button>
        <Link className="reply-link" to={`/posts/${post.id}`}>Reply</Link>
        {/* This will now display correctly when the post data updates */}
        {post.flagged && <span className="flagged-status">Flagged</span>}
      </div>
    </div>
  );
}