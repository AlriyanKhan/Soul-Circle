import React from 'react';
import '../../styles/QuestionCard.css';

export default function QuestionCard({ index, question, options, value, onChange }) {
  return (
    <div className="question-card">
      <h4>Q{index + 1}. {question}</h4>
      <div className="options-container">
        {options.map(opt => (
          <label key={opt.value} className="option-label">
            <input type="radio" name={`q-${index}`} checked={value === opt.value} onChange={() => onChange(opt.value)} />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}