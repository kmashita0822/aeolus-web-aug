import React, { Suspense, lazy } from 'react'

// Lazy load the heavy GlobeVisualization component
const GlobeVisualization = lazy(() => import('./GlobeVisualization'))

const ContentSection: React.FC = () => {
  return (
    <section className="content-section">
      <div className="content-container">
        {/* Globe Visualization in the middle */}
        <div className="globe-container">
          <Suspense fallback={
            <div className="globe-loading">
              <div className="loading-spinner"></div>
              <p>Loading visualization...</p>
            </div>
          }>
            <GlobeVisualization />
          </Suspense>
        </div>

        {/* C-130 Aircraft in the center */}
        <div className="c130-container">
          <img 
            src="/assets/c-130.svg" 
            alt="C-130 Aircraft" 
            className="c130-aircraft"
          />
        </div>

        {/* Text block positioned on the right */}
        <div className="section-text-block">
          <p className="section-hero-text">
            At Aeolus, we're protecting civilizations through intelligent intervention Infrastructure that act before catastrophe strikes.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ContentSection 