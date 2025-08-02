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
    <section 
      className="hero-section" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100vh', 
        backgroundColor: '#0a0a0a',
        color: 'white',
        padding: '40px'
      }}
    >
      <div 
        className="video-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a'
        }}
      >
        <video 
          ref={videoRef}
          className="hero-video" 
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="metadata"
          onError={(e) => console.error('Video error event:', e)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        >
          <source src="/assets/aeolus.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div 
        className="hero-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.45) 0%, rgba(10, 10, 10, 0.45) 70%, rgba(0, 0, 0, 1) 100%)'
        }}
      ></div>
      
      {/* Hero text block */}
      <div 
        className="hero-text-block"
        style={{
          position: 'absolute',
          top: '58%',
          left: 0,
          right: 0,
          padding: '0 40px',
          color: 'white'
        }}
      >
        <p 
          className="hero-text"
          style={{
            fontSize: '1.5rem',
            lineHeight: 1.4,
            maxWidth: '600px'
          }}
        >
          We live on a planet of storms, droughts, and floods, surrounded by the raw power of a world we live on but do not yet live with.
        </p>
      </div>
      
      {/* Header container for logo and modal trigger */}
      <div 
        className="header-container"
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          right: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <img 
          src="/assets/aeolus-logo.svg" 
          alt="Aeolus Logo" 
          className="hero-logo"
          style={{
            height: '40px',
            width: 'auto'
          }}
        />
        
        {/* Disaster Alerts Component */}
        <DisasterAlerts />
      </div>
    </section>
  )
}

export default HeroSection 