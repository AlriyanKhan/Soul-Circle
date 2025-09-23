import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import CategoryCard from '../components/library/CategoryCard'
import ResourceCard from '../components/library/ResourceCard'

export default function ResourceLibrary() {
  const [resources, setResources] = useState([])
  const [category, setCategory] = useState('')

  async function load() {
    const res = await api.get('/api/resources', { params: { category: category || undefined } })
    setResources(res.data.resources)
  }

  useEffect(() => { load() }, [category])

  const cats = ['mindfulness', 'anxiety', 'self-care', 'depression', 'therapy']

  return (
    <div>
      <h2>Resource Library</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {cats.map(c => <CategoryCard key={c} name={c} onClick={setCategory} />)}
        <button onClick={() => setCategory('')}>All</button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {resources.map(r => <ResourceCard key={r.id} item={r} />)}
      </div>
    </div>
  )
}
