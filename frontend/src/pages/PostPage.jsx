import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)

  useEffect(() => { api.get(`/api/forum/posts/${id}`).then(res => setPost(res.data.post)) }, [id])

  if (!post) return <p>Loading...</p>

  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <small>Category: {post.category}</small>
    </article>
  )
}
