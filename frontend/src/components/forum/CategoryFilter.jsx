import React from 'react'

export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">All</option>
      {categories.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  )
}
