import React from 'react'

const ThirdSection: React.FC = () => {
  return (
    <section className="third-section">
      <div className="image-container">
        <img className="third-image" src="/assets/ourfuture.png" alt="Our Future" />
      </div>
      <div className="third-overlay"></div>

      {/* Third section text block */}
      <div className="third-text-block">
        <p className="third-text">
          Building on that promise, we're learning to harness Earth's natural energy flows, powering a civilization that grows with its home, not away from it.
        </p>
      </div>
    </section>
  )
}

export default ThirdSection 