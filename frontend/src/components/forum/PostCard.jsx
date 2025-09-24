import React from 'react'
import { Link } from 'react-router-dom'

export default function PostCard({ post, onLike, onUpvote, onReport, onReply }) {
  const authorLabel = post.anonymous ? 'Anonymous' : (post.authorName || 'Member')
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <h3 style={{ margin: '0 0 8px 0' }}><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
      <p>{post.content}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <small>By: {authorLabel}</small>
        <small>Category: {post.category}</small>
        <button onClick={() => onLike(post.id)}>Like ({post.likes || 0})</button>
        <button onClick={() => onUpvote(post.id)}>Support ({post.upvotes || 0})</button>
        <button onClick={() => onReport(post.id)}>Report</button>
        <Link to={`/posts/${post.id}`}>Reply</Link>
        {post.flagged && <span style={{ color: 'red' }}>Flagged</span>}
      </div>
    </div>
  )
}
