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
      hostUrl: window.BOTPRESS_HOST_URL || 'https://cdn.botpress.cloud/webchat',
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
    <div>
      <h2>Welcome to SOUL-CIRCLE</h2>
      <p>Your first-aid psychological companion.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/tests"><button>Take Test</button></Link>
        <Link to="/forum"><button>Forum</button></Link>
        <Link to="/resources"><button>Resource Library</button></Link>
        <button onClick={openConsultant}>Contact Consultant</button>
      </div>
      <ConsultantInfoModal open={showModal} onClose={() => setShowModal(false)} consultant={consultant} />
    </div>
  )
}
