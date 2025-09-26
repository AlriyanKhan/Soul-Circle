import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { resources as staticResources } from '../../data/resources';
import '../../styles/ResultsDisplay.css';

export default function ResultsDisplay({ score, severity, feedback, categories }) {
  const [consultant, setConsultant] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    api.get('/api/consultant').then(res => setConsultant(res.data.consultant)).catch(() => setConsultant(null));
  }, []);

  function suggestions() {
    const mild = ['Minimal', 'Mild'];
    const moderate = ['Moderate'];
    if (mild.includes(severity)) {
      return { books: staticResources.books.slice(0, 2), videos: staticResources.videos.slice(0, 2), showConsultant: false };
    }
    if (moderate.includes(severity)) {
      return { books: staticResources.books.slice(1, 3), videos: staticResources.videos.slice(0, 2), showConsultant: true };
    }
    return { books: staticResources.books, videos: staticResources.videos, showConsultant: true };
  }

  const recs = suggestions();

  return (
    <div className="results-display">
      <h3>Results</h3>
      <div className="results-summary">
        <p><b>Score:</b> {score} | <b>Severity:</b> {severity}</p>
        <p>{feedback}</p>
        {categories && categories.length > 0 && (
          <p><b>Recommended categories:</b> {categories.join(', ')}</p>
        )}
      </div>

      <div className="suggested-resources">
        <h4>Suggested resources</h4>
        <div>
          <b>Books</b>
          <ul>
            {recs.books.map((b, i) => (
              <li key={`b-${i}`}><a href={b.url} target="_blank" rel="noreferrer">{b.title}</a>{b.author ? ` — ${b.author}` : ''}</li>
            ))}
          </ul>
        </div>
        <div>
          <b>Videos</b>
          <ul>
            {recs.videos.map((v, i) => (
              <li key={`v-${i}`}><a href={v.url} target="_blank" rel="noreferrer">{v.title}</a>{v.speaker ? ` — ${v.speaker}` : ''}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="consultant-contact">
        <h4>Need to talk to someone?</h4>
        <button onClick={() => setShow(s => !s)} className="btn">{show ? 'Hide' : 'Contact Consultant'}</button>
        {(show || recs.showConsultant) && (
          <div className="consultant-details">
            <p><b>Name:</b> {consultant?.name || '—'}</p>
            <p><b>Email:</b> {consultant?.email || '—'}</p>
            <p><b>Phone:</b> {consultant?.phone || '—'}</p>
            <p><b>Office hours:</b> {consultant?.officeHours || '—'}</p>
            {consultant?.bookingUrl && (
              <p><a href={consultant.bookingUrl} target="_blank" rel="noreferrer">Book Appointment</a></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}