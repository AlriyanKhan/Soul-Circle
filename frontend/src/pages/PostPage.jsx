import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'

function ReplyTree({ node, onUpvote, onReport, onReply }) {
  return (
    <div style={{ borderLeft: '2px solid #eee', marginLeft: 12, paddingLeft: 12 }}>
      <p>{node.content}</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <small>By: {node.anonymous ? 'Anonymous' : (node.authorName || 'Member')}</small>
        <button onClick={() => onUpvote(node.id)}>Support ({node.upvotes || 0})</button>
        <button onClick={() => onReport(node.id)}>Report</button>
      </div>
      {node.replies && node.replies.map(r => (
        <ReplyTree key={r.id} node={r} onUpvote={onUpvote} onReport={onReport} onReply={onReply} />
      ))}
    </div>
  )
}

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [replies, setReplies] = useState([])
  const [content, setContent] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  async function load() {
    const [p, r] = await Promise.all([
      api.get(`/api/forum/posts/${id}`),
      api.get(`/api/forum/posts/${id}/replies`)
    ])
    setPost(p.data.post)
    setReplies(r.data.replies)
  }

  useEffect(() => { load() }, [id])

  async function submitReply(parentReplyId) {
    await api.post(`/api/forum/posts/${id}/replies`, { content, anonymous, parentReplyId: parentReplyId || null })
    setContent('')
    setAnonymous(false)
    load()
  }

  async function upvoteReply(rid) {
    await api.post(`/api/forum/replies/${rid}/upvote`)
    load()
  }

  async function reportReply(rid) {
    await api.post(`/api/forum/replies/${rid}/report`, { reason: 'inappropriate' })
    load()
  }

  if (!post) return <p>Loading...</p>

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <small>Category: {post.category}</small>

      <section style={{ marginTop: 24 }}>
        <h3>Replies</h3>
        <div>
          {replies.map(r => (
            <ReplyTree key={r.id} node={r} onUpvote={upvoteReply} onReport={reportReply} onReply={() => {}} />
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <h4>Add a reply</h4>
          <textarea placeholder="Write a reply" value={content} onChange={e => setContent(e.target.value)} />
          <br />
          <label>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} /> Reply anonymously
          </label>
          <br />
          <button onClick={() => submitReply(null)}>Reply</button>
        </div>
      </section>
    </article>
  )
}
