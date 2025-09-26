import React from 'react'
import '../../styles/Footer.css'; 

export default function Footer() {
  return (
    <footer className="footer">
      <small>© {new Date().getFullYear()} SOUL-CIRCLE</small>
    </footer>
  )
}