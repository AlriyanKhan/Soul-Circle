import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { login } = useAuth()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/api/auth/signup', { email, password, name })
      login(res.data.token, res.data.user)
      nav('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360 }}>
      <h2>Signup</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" value={password} type="password" onChange={e => setPassword(e.target.value)} />
      <button type="submit">Create Account</button>
      <p>Have an account? <Link to="/login">Login</Link></p>
    </form>
  )
}
