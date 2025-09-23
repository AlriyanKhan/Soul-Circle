import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
      <h1 style={{ margin: 0, fontSize: 20 }}><Link to="/">SOUL-CIRCLE</Link></h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/tests">Take Test</Link>
        <Link to="/forum">Forum</Link>
        <Link to="/resources">Resource Library</Link>
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  )
}
