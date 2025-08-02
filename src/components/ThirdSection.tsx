import React from 'react'

const ThirdSection: React.FC = () => {
  return (
    <section className="third-section">
      <div className="image-container">
        <img className="third-image" src="/assets/ourfuture.png" alt="Our Future" />
        <div className="third-overlay"></div>
      </div>
      
      <div className="third-text-block">
        <p className="third-text">
          Our future is not predetermined. It's shaped by the choices we make today, the technologies we develop, and the systems we build to protect what matters most.
        </p>
      </div>
    </section>
  )
}

export default ThirdSection 