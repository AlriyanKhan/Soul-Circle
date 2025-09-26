import React from 'react';
import '../../styles/CategoryFilter.css';

export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <select className="category-filter" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">All Categories</option>
      {categories.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}