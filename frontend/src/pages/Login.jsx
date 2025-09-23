import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { state } = useLocation()
  const { login } = useAuth()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/api/auth/login', { email, password })
      login(res.data.token, res.data.user)
      nav(state?.from?.pathname || '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360 }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" value={password} type="password" onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <p>No account? <Link to="/signup">Signup</Link></p>
    </form>
  )
}
