import React from 'react'
import HeroSection from './components/HeroSection'
import ContentSection from './components/ContentSection'
import ThirdSection from './components/ThirdSection'
import DetailModal from './components/DetailModal'

const App: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ContentSection />
      <ThirdSection />
      <DetailModal />
    </>
  )
}

export default App 