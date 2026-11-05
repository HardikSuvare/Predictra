import { useEffect } from 'react'
import BrandLogo from './BrandLogo'

function SplashScreen({ onComplete }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete()
    }, 1800)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="splash-screen">

      <div className="splash-content">

        <div className="splash-logo">
          <BrandLogo />
        </div>

        <h1 className="splash-title">
          PREDICTRA
        </h1>

        <p className="splash-tagline">
          Predict. Understand. Retain.
        </p>

        <p className="splash-description">
          AI-Powered Customer Intelligence
        </p>

        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>

      </div>

    </div>
  )
}

export default SplashScreen