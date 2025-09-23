import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside style={{ borderRight: '1px solid #eee', padding: 16 }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link to="/">Home</Link>
        <Link to="/tests">Take Test</Link>
        <Link to="/forum">Forum</Link>
        <Link to="/resources">Resource Library</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </aside>
  )
}
