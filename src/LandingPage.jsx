import ChatBot from './ChatBot.jsx'

const HIGHLIGHTS = [
  { icon: '⏱️', title: 'Instant Response', text: 'Help within minutes' },
  { icon: '📍', title: 'Live Tracking', text: 'Follow your ambulance' },
  { icon: '👨‍⚕️', title: 'Professional Care', text: 'Trained paramedics' },
  { icon: '💳', title: 'Easy Payment', text: 'UPI, cards & cash' },
]

const STATS = [
  { value: '4 min', label: 'Avg. response time' },
  { value: '50,000+', label: 'Rides completed' },
  { value: '200+', label: 'Ambulances on road' },
  { value: '24/7', label: 'Always available' },
]

function LandingPage({ onGetStarted, onLaunchCommandCenter }) {
  return (
    <main className="landing-page">
      <div className="landing-logo-container">
        <img src="/logo.png" alt="IntelliVehicle Logo" className="landing-logo-top" />
        <button type="button" className="command-center-link" onClick={onLaunchCommandCenter}>
          Launch Command Center →
        </button>
      </div>

      <section className="landing-hero">
        <div className="landing-container">
          <div className="logo-section">
            <span className="hero-badge">🚑 Emergency medical transport, on demand</span>
            <h1 className="landing-title">IntelliVehicle</h1>
            <p className="landing-tagline">Emergency Ambulance at Your Fingertips</p>
            <p className="hero-lead">
              Book a fully-equipped ambulance in seconds, track it live, and get
              professional care on the way — any time, anywhere in the city.
            </p>

            <div className="landing-cta hero-cta">
              <button onClick={onGetStarted} className="cta-button">
                Get Started
              </button>
              <p className="cta-text">Sign up now as a user or driver</p>
            </div>

            <p className="hero-emergency">
              Life-threatening emergency? Call <strong>108</strong> or <strong>112</strong>
            </p>
          </div>

          <div className="hero-highlights">
            {HIGHLIGHTS.map((h) => (
              <div className="highlight-card" key={h.title}>
                <span className="highlight-icon">{h.icon}</span>
                <div>
                  <h3>{h.title}</h3>
                  <p>{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-stats">
        <div className="stats-grid">
          {STATS.map((s) => (
            <div className="stat-card" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <ChatBot />
    </main>
  )
}

export default LandingPage
