import React, { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { resources as staticResources } from '../../data/resources'
 
export default function ResultsDisplay({ score, severity, feedback, categories }) {
  const [consultant, setConsultant] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    api.get('/api/consultant').then(res => setConsultant(res.data.consultant)).catch(() => setConsultant(null))
  }, [])

  // Select resources to suggest based on severity
  function suggestions() {
    const mild = ['Minimal', 'Mild']
    const moderate = ['Moderate']
    const severe = ['Moderately severe', 'Severe']
    if (mild.includes(severity)) {
      return {
        books: staticResources.books.slice(0, 2),
        videos: staticResources.videos.slice(0, 2),
        showConsultant: false,
      }
    }
    if (moderate.includes(severity)) {
      return {
        books: staticResources.books.slice(1, 3),
        videos: staticResources.videos.slice(0, 2),
        showConsultant: true,
      }
    }
    return {
      books: staticResources.books,
      videos: staticResources.videos,
      showConsultant: true,
    }
  }

  const recs = suggestions()

  return (
    <div style={{ border: '1px solid #4caf50', borderRadius: 8, padding: 12, background: '#f4fff5' }}>
      <h3>Results</h3>
      <p><b>Score:</b> {score} | <b>Severity:</b> {severity}</p>
      <p>{feedback}</p>
      {categories && categories.length > 0 && (
        <p><b>Recommended categories:</b> {categories.join(', ')}</p>
      )}

      <div style={{ marginTop: 12 }}>
        <h4>Suggested resources</h4>
        <div>
          <b>Books</b>
          <ul>
            {recs.books.map((b, i) => (
              <li key={`b-${i}`}><a href={b.url} target="_blank" rel="noreferrer">{b.title}</a>{b.author ? ` — ${b.author}` : ''}</li>
            ))}
          </ul>
        </div>
        <div>
          <b>Videos</b>
          <ul>
            {recs.videos.map((v, i) => (
              <li key={`v-${i}`}><a href={v.url} target="_blank" rel="noreferrer">{v.title}</a>{v.speaker ? ` — ${v.speaker}` : ''}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 12, borderTop: '1px dashed #9ccc9c', paddingTop: 8 }}>
        <h4>Need to talk to someone?</h4>
        <button onClick={() => setShow(s => !s)}>{show ? 'Hide' : 'Contact Consultant'}</button>
        {(show || recs.showConsultant) && (
          <div style={{ marginTop: 8, background: '#fff', padding: 10, borderRadius: 6 }}>
            <p><b>Name:</b> {consultant?.name || '—'}</p>
            <p><b>Email:</b> {consultant?.email || '—'}</p>
            <p><b>Phone:</b> {consultant?.phone || '—'}</p>
            <p><b>Office hours:</b> {consultant?.officeHours || '—'}</p>
            {consultant?.bookingUrl && (
              <p><a href={consultant.bookingUrl} target="_blank" rel="noreferrer">Book Appointment</a></p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
