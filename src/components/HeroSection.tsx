import React, { useRef, useEffect } from 'react'
import DisasterAlerts from './DisasterAlerts'

const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Add event listeners for debugging
      video.addEventListener('loadstart', () => console.log('Video loadstart'))
      video.addEventListener('loadeddata', () => console.log('Video loadeddata'))
      video.addEventListener('canplay', () => console.log('Video canplay'))
      video.addEventListener('play', () => console.log('Video play'))
      video.addEventListener('error', (e) => console.error('Video error:', e))
      
      // Try to play the video
      video.play().catch(error => {
        console.error('Video play failed:', error)
      })
    }
  }, [])

  return (
    <section className="hero-section">
      <div className="video-container">
        <video 
          ref={videoRef}
          className="hero-video" 
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="metadata"
          onError={(e) => console.error('Video error event:', e)}
        >
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