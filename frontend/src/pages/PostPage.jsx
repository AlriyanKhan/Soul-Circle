import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/PostPage.css'; // Import the new CSS file

// The ReplyTree component is updated to use classNames instead of inline styles
function ReplyTree({ node, onUpvote, onReport }) {
  return (
    <div className="reply-tree">
      <p className="reply-content">{node.content}</p>
      <div className="reply-meta">
        <small>By: {node.anonymous ? 'Anonymous' : (node.authorName || 'Member')}</small>
        <button onClick={() => onUpvote(node.id)}>Support ({node.upvotes || 0})</button>
        <button onClick={() => onReport(node.id)}>Report</button>
      </div>
      {/* Nested replies will also get the same styling */}
      {node.replies && node.replies.map(r => (
        <ReplyTree key={r.id} node={r} onUpvote={onUpvote} onReport={onReport} />
      ))}
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  async function load() {
    const [p, r] = await Promise.all([
      api.get(`/api/forum/posts/${id}`),
      api.get(`/api/forum/posts/${id}/replies`)
    ]);
    setPost(p.data.post);
    setReplies(r.data.replies);
  }

  useEffect(() => { load() }, [id]);

  async function submitReply(parentReplyId) {
    await api.post(`/api/forum/posts/${id}/replies`, { content, anonymous, parentReplyId: parentReplyId || null });
    setContent('');
    setAnonymous(false);
    load();
  }

  async function upvoteReply(rid) {
    await api.post(`/api/forum/replies/${rid}/upvote`);
    load();
  }

  async function reportReply(rid) {
    await api.post(`/api/forum/replies/${rid}/report`, { reason: 'inappropriate' });
    load();
  }

  if (!post) return <p>Loading...</p>;

  return (
    <article className="post-page-container">
      <header className="post-header">
        <h2 className="post-title">{post.title}</h2>
        <p className="post-body">{post.content}</p>
        <small className="post-category">Category: {post.category}</small>
      </header>

      <section className="replies-section">
        <h3>Replies</h3>
        <div>
          {replies.map(r => (
            <ReplyTree key={r.id} node={r} onUpvote={upvoteReply} onReport={reportReply} />
          ))}
        </div>

        <div className="add-reply-form">
          <h4>Add a reply</h4>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Write a reply"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="form-group form-checkbox">
            <input
              id="anonymous-reply"
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous-reply">Reply anonymously</label>
          </div>
          <button className="btn" onClick={() => submitReply(null)}>Post Reply</button>
        </div>
      </section>
    </article>
  );
}