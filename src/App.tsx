import React from 'react'
import HeroSection from './components/HeroSection'
import ContentSection from './components/ContentSection'
import ThirdSection from './components/ThirdSection'
import DetailModal from './components/DetailModal'

const App: React.FC = () => {
  return (
    <>
      <div style={{ color: 'white', padding: '20px', background: 'black', minHeight: '100vh' }}>
        <h1>React App is Loading!</h1>
        <p>If you can see this, React is working.</p>
      </div>
      <HeroSection />
      <ContentSection />
      <ThirdSection />
      <DetailModal />
    </>
  )
}

export default App 