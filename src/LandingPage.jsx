import { useState } from 'react'

function LandingPage({ onGetStarted }) {
  return (
    <main className="landing-page">
      <div className="landing-logo-container">
        <img src="/logo.png" alt="IntelliVehicle Logo" className="landing-logo-top" />
      </div>

      <section className="landing-hero">
        <div className="landing-container">
          <div className="logo-section">
            <h1 className="landing-title">IntelliVehicle</h1>
            <p className="landing-tagline">Emergency Ambulance at Your Fingertips</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Instant Response</h3>
              <p>Request an ambulance anytime and get help within minutes</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Anywhere Coverage</h3>
              <p>Available 24/7 across the city with real-time location tracking</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👨‍⚕️</div>
              <h3>Professional Care</h3>
              <p>Trained paramedics and medical-grade equipment on board</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Real-Time Updates</h3>
              <p>Track your ambulance and receive live updates on arrival time</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Easy Payment</h3>
              <p>Secure and flexible payment options for all emergencies</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Data Privacy</h3>
              <p>Your medical information is secure and confidential</p>
            </div>
          </div>

          <div className="landing-cta">
            <button onClick={onGetStarted} className="cta-button">
              Get Started
            </button>
            <p className="cta-text">Sign up now as a user or driver</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
