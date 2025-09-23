import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import TestSelectorCard from '../components/tests/TestSelectorCard'
import QuestionCard from '../components/tests/QuestionCard'
import ResultsDisplay from '../components/tests/ResultsDisplay'

export default function ScreeningTests() {
  const [defs, setDefs] = useState(null)
  const [current, setCurrent] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get('/api/tests/definitions').then(res => setDefs(res.data.tests))
  }, [])

  useEffect(() => { if (current && defs) setAnswers(new Array(defs[current].items.length).fill(0)) }, [current, defs])

  if (!defs) return <p>Loading tests...</p>

  async function submit() {
    const res = await api.post('/api/tests/submit', { testType: current, answers })
    setResult(res.data)
  }

  return (
    <div>
      <h2>Psychological Screening Tests</h2>
      {!current && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <TestSelectorCard name="PHQ-9" description="Screens for depression severity" onSelect={setCurrent} />
          <TestSelectorCard name="GAD-7" description="Screens for anxiety severity" onSelect={setCurrent} />
        </div>
      )}

      {current && !result && (
        <div>
          <h3>{current}</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {defs[current].items.map((q, idx) => (
              <QuestionCard key={idx} index={idx} question={q} options={defs[current].options} value={answers[idx]} onChange={(v) => {
                const copy = [...answers]; copy[idx] = v; setAnswers(copy)
              }} />
            ))}
          </div>
          <button onClick={submit} style={{ marginTop: 12 }}>Submit</button>
        </div>
      )}

      {result && (
        <ResultsDisplay score={result.score} severity={result.severity} feedback={result.feedback} categories={result.recommendedCategories} />
      )}
    </div>
  )
}
