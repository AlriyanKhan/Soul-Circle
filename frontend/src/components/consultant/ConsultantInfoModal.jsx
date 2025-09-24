import React from 'react'

export default function ConsultantInfoModal({ open, onClose, consultant }) {
  if (!open) return null
  const c = consultant || {}
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 16, borderRadius: 8, maxWidth: 420, width: '90%' }}>
        <h3>Psychological Consultant</h3>
        <p><b>Name:</b> {c.name || '—'}</p>
        <p><b>Email:</b> {c.email || '—'}</p>
        <p><b>Phone:</b> {c.phone || '—'}</p>
        <p><b>Office hours:</b> {c.officeHours || '—'}</p>
        {c.bookingUrl && (
          <p><a href={c.bookingUrl} target="_blank" rel="noreferrer">Book Appointment</a></p>
        )}
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}