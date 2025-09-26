import React from 'react';
import '../../styles/ResourceCard.css'; // Import the new CSS

export default function ResourceCard({ item }) {
  const byline = item.author || item.speaker || '';
  return (
    <div className="resource-card">
      <h3>{item.title}</h3>
      {byline && <p className="resource-byline"><small>By: {byline}</small></p>}
      {item.description && <p className="resource-description">{item.description}</p>}
      <a className="resource-link" href={item.url} target="_blank" rel="noreferrer">
        Open Resource
      </a>
    </div>
  );
}