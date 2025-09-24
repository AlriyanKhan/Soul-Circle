import React, { useEffect, useState } from 'react'
import CategoryCard from '../components/library/CategoryCard'
import ResourceCard from '../components/library/ResourceCard'
import { resources as staticResources } from '../data/resources'

export default function ResourceLibrary() {
  const [tab, setTab] = useState('books')

  const cats = [
    { key: 'books', label: 'Books (Self-Help & Motivation)' },
    { key: 'videos', label: 'Videos (Self-Help & Motivation)' },
  ]

  const list = tab === 'books' ? staticResources.books : staticResources.videos

  return (
    <div>
      <h2>Resource Library</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c.key} onClick={() => setTab(c.key)} disabled={tab === c.key}>{c.label}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {list.map((r, idx) => <ResourceCard key={idx} item={r} />)}
      </div>
    </div>
  )
}
