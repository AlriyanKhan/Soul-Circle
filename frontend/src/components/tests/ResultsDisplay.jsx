import React from 'react'

export default function ResultsDisplay({ score, severity, feedback, categories }) {
  return (
    <div style={{ border: '1px solid #4caf50', borderRadius: 8, padding: 12, background: '#f4fff5' }}>
      <h3>Results</h3>
      <p><b>Score:</b> {score} | <b>Severity:</b> {severity}</p>
      <p>{feedback}</p>
      {categories && categories.length > 0 && (
        <p><b>Recommended categories:</b> {categories.join(', ')}</p>
      )}
    </div>
  )
}
