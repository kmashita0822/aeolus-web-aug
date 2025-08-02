import React from 'react'
import DisasterAlerts from './DisasterAlerts'

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="video-container">
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata">
          <source src="/assets/aeolus.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="hero-overlay"></div>
      
      {/* Hero text block */}
      <div className="hero-text-block">
        <p className="hero-text">
          We live on a planet of storms, droughts, and floods, surrounded by the raw power of a world we live on but do not yet live with.
        </p>
      </div>
      
      {/* Header container for logo and modal trigger */}
      <div className="header-container">
        <img src="/assets/aeolus-logo.svg" alt="Aeolus Logo" className="hero-logo" />
        
        {/* Disaster Alerts Component */}
        <DisasterAlerts />
      </div>
    </section>
  )
}

export default HeroSection 