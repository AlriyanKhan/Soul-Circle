import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  if (!user) return <p>Loading...</p>
  return (
    <div>
      <h2>Profile</h2>
      <p><b>Name:</b> {user.name || '—'}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Role:</b> {user.role}</p>
    </div>
  )
}
