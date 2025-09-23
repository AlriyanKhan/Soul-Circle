import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [analytics, setAnalytics] = useState({})

  async function load() {
    const [u, r, a] = await Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/reports'),
      api.get('/api/admin/analytics/tests'),
    ])
    setUsers(u.data.users)
    setReports(r.data.reports)
    setAnalytics(a.data.analytics)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Users</h3>
        <ul>
          {users.map(u => <li key={u.id}>{u.email} ({u.role})</li>)}
        </ul>
      </section>
      <section>
        <h3>Flagged Reports</h3>
        <ul>
          {reports.map(r => <li key={r.id}>{r.reason} (post: {r.post_id})</li>)}
        </ul>
      </section>
      <section>
        <h3>Test Analytics</h3>
        <pre>{JSON.stringify(analytics, null, 2)}</pre>
      </section>
    </div>
  )
}
