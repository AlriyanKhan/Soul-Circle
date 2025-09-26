import React, { useState } from 'react';
import ResourceCard from '../components/library/ResourceCard';
import { resources as staticResources } from '../data/resources';
import '../styles/ResourceLibrary.css'; // Import the new CSS

export default function ResourceLibrary() {
  const [tab, setTab] = useState('books');

  const cats = [
    { key: 'books', label: 'Books (Self-Help & Motivation)' },
    { key: 'videos', label: 'Videos (Self-Help & Motivation)' },
  ];

  const list = tab === 'books' ? staticResources.books : staticResources.videos;

  return (
    <div className="library-container">
      <h2>Resource Library</h2>
      <div className="library-tabs">
        {cats.map(c => (
          // We use a dynamic class to highlight the active tab
          <button
            key={c.key}
            onClick={() => setTab(c.key)}
            className={`tab-button ${tab === c.key ? 'active' : ''}`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="resource-grid">
        {list.map((r, idx) => <ResourceCard key={idx} item={r} />)}
      </div>
    </div>
  );
}