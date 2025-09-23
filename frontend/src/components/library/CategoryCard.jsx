import React from 'react'

export default function CategoryCard({ name, onClick }) {
  return (
    <div onClick={() => onClick(name)} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, cursor: 'pointer' }}>
      <h4 style={{ margin: 0 }}>{name}</h4>
    </div>
  )
}
