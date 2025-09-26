import React from 'react';
import '../../styles/TestSelectorCard.css';

export default function TestSelectorCard({ name, description, onSelect }) {
  return (
    <div onClick={() => onSelect(name)} className="test-selector-card">
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
}