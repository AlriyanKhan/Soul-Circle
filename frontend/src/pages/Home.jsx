import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import ConsultantInfoModal from '../components/consultant/ConsultantInfoModal'
import '../styles/Home.css';

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [consultant, setConsultant] = useState(null)

  useEffect(() => {
    // Inject Botpress webchat if available
    const s = document.createElement('script')
    s.src = 'https://cdn.botpress.cloud/webchat/v1/inject.js'
    s.async = true
    document.body.appendChild(s)

    const init = document.createElement('script')
    init.innerHTML = `window.botpressWebChat && window.botpressWebChat.init({
      botId: window.BOTPRESS_BOT_ID || 'YOUR_BOT_ID',
      clientId: window.BOTPRESS_CLIENT_ID || 'YOUR_CLIENT_ID',
      hostUrl: window.BOTPRESS_HOST_URL || 'https://cdn.botpress.cloud',
      messagingUrl: window.BOTPRESS_MESSAGING_URL || 'https://messaging.botpress.cloud',
      botName: 'SOUL-CIRCLE Assistant'
    })`
    document.body.appendChild(init)

    return () => {
      document.body.removeChild(s)
      document.body.removeChild(init)
    }
  }, [])

  async function openConsultant() {
    try {
      const res = await api.get('/api/consultant')
      setConsultant(res.data.consultant)
      setShowModal(true)
    } catch (_) {
      setConsultant(null)
      setShowModal(true)
    }
  }

  return (
    <div className="home-container">
      <h2>Welcome to SOUL-CIRCLE</h2>
      <p className="home-subtitle">Your first-aid psychological companion. Choose an option below to get started.</p>

      {/* --- Updated Card Grid --- */}
      <div className="home-grid">
        
        <Link to="/tests" className="home-card">
          <h3>Take a Screening Test</h3>
          <p>Assess your mental well-being with confidential tests like PHQ-9 and GAD-7.</p>
        </Link>
        
        <Link to="/forum" className="home-card">
          <h3>Community Support Forum</h3>
          <p>Connect with others, share your experiences, and find support in a safe community.</p>
        </Link>
        
        <Link to="/resources" className="home-card">
          <h3>Resource Library</h3>
          <p>Explore a curated library of articles, videos, and tools for self-help and growth.</p>
        </Link>

        {/* This card is a div that triggers a function, maintaining the original behavior */}
        <div onClick={openConsultant} className="home-card">
          <h3>Contact a Consultant</h3>
          <p>Get in touch with a professional consultant for personalized guidance and support.</p>
        </div>

      </div>

      <ConsultantInfoModal open={showModal} onClose={() => setShowModal(false)} consultant={consultant} />
    </div>
  )
}