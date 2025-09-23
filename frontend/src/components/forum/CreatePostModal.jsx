import React, { useState } from 'react'

export default function CreatePostModal({ onCreate }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')

  return (
    <div style={{ border: '1px dashed #aaa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
      <h4>Create a Post</h4>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <br />
      <textarea placeholder="Share your thoughts" value={content} onChange={e => setContent(e.target.value)} />
      <br />
      <label>Category: </label>
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="general">general</option>
        <option value="anxiety">anxiety</option>
        <option value="depression">depression</option>
        <option value="stress">stress</option>
        <option value="mindfulness">mindfulness</option>
        <option value="self-care">self-care</option>
      </select>
      <br />
      <button onClick={() => onCreate({ title, content, category })}>Post</button>
    </div>
  )
}
