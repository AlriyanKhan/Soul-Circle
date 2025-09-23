import React from 'react'

export default function TestSelectorCard({ name, description, onSelect }) {
  return (
    <div onClick={() => onSelect(name)} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, cursor: 'pointer' }}>
      <h3 style={{ marginTop: 0 }}>{name}</h3>
      <p>{description}</p>
    </div>
  )
}
