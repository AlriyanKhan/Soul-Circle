import React from 'react'

export default function ResourceCard({ item }) {
  const byline = item.author || item.speaker || ''
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>{item.title}</h3>
      {byline && <p style={{ marginTop: 0 }}><small>{byline}</small></p>}
      {item.description && <p>{item.description}</p>}
      <a href={item.url} target="_blank" rel="noreferrer">Open</a>
    </div>
  )
}
