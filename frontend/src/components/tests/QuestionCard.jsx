import React from 'react'

export default function QuestionCard({ index, question, options, value, onChange }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <h4>Q{index + 1}. {question}</h4>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="radio" name={`q-${index}`} checked={value === opt.value} onChange={() => onChange(opt.value)} />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}
