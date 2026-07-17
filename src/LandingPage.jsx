import ChatBot from './ChatBot.jsx'

const FEATURES = [
  { icon: '⏱️', title: 'Instant Response', text: 'Request an ambulance anytime and get help within minutes.' },
  { icon: '📍', title: 'Anywhere Coverage', text: 'Available 24/7 across the city with real-time location tracking.' },
  { icon: '👨‍⚕️', title: 'Professional Care', text: 'Trained paramedics and medical-grade equipment on board.' },
  { icon: '💬', title: 'Real-Time Updates', text: 'Track your ambulance and receive live updates on arrival time.' },
  { icon: '💳', title: 'Easy Payment', text: 'Secure and flexible payment options for all emergencies.' },
  { icon: '🔒', title: 'Data Privacy', text: 'Your medical information is secure and confidential.' },
]

const STATS = [
  { value: '4 min', label: 'Avg. response time' },
  { value: '50,000+', label: 'Rides completed' },
  { value: '200+', label: 'Ambulances on road' },
  { value: '24/7', label: 'Always available' },
]

const STEPS = [
  { num: '1', title: 'Sign up', text: 'Create a user or driver account in about a minute.' },
  { num: '2', title: 'Request', text: 'Tap Request Ambulance and share your location.' },
  { num: '3', title: 'Get matched', text: 'The nearest available driver is dispatched instantly.' },
  { num: '4', title: 'Track & arrive', text: 'Follow the ambulance live until it reaches you.' },
]

const SERVICES = [
  { icon: '🚑', title: 'Emergency Ambulance', text: 'Life-support equipped ambulances for critical, time-sensitive emergencies.' },
  { icon: '🏥', title: 'Hospital Transfers', text: 'Safe, monitored transport between hospitals and care facilities.' },
  { icon: '🩺', title: 'Medical Escort', text: 'Trained paramedics accompany patients who need supervision en route.' },
  { icon: '📅', title: 'Scheduled Pickups', text: 'Book non-emergency rides in advance for appointments and check-ups.' },
]

const TESTIMONIALS = [
  { quote: 'The ambulance reached my father in under five minutes. IntelliVehicle genuinely saved his life.', name: 'Priya Sharma', role: 'Bengaluru' },
  { quote: 'As a driver, the app makes it easy to accept nearby requests and reach patients fast.', name: 'Rahul Verma', role: 'Driver partner' },
  { quote: 'Live tracking kept our whole family calm during a scary night. Highly recommended.', name: 'Anita Desai', role: 'Pune' },
]

const FAQS = [
  { q: 'How quickly can an ambulance arrive?', a: 'In covered areas, the nearest ambulance is typically dispatched within minutes, with live tracking so you always know the arrival time.' },
  { q: 'Which emergency numbers should I call?', a: 'For life-threatening emergencies call 108 (ambulance) or 112 (all-India emergency). You can also request instantly from the app once signed in.' },
  { q: 'How does payment work?', a: 'We support UPI, cards, and cash. You only pay after the trip, and a receipt is saved to your account automatically.' },
  { q: 'Can I register as a driver?', a: 'Yes. Choose Driver Sign Up on the home page to respond to nearby requests and earn as a verified partner.' },
]

function LandingPage({ onGetStarted }) {
  return (
    <main className="landing-page">
      <div className="landing-logo-container">
        <img src="/logo.png" alt="IntelliVehicle Logo" className="landing-logo-top" />
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
          </div>

          <div className="landing-cta hero-cta">
            <button onClick={onGetStarted} className="cta-button">
              Get Started
            </button>
            <p className="cta-text">Sign up now as a user or driver</p>
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

      <section className="landing-section">
        <div className="section-head">
          <h2 className="section-title">Why choose IntelliVehicle</h2>
          <p className="section-subtitle">Everything you need in a medical emergency, in one app.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle">Help is only four simple steps away.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map((step) => (
            <div className="step-card" key={step.num}>
              <span className="step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <h2 className="section-title">Our services</h2>
          <p className="section-subtitle">More than emergencies — care for every journey.</p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <div className="service-card" key={s.title}>
              <div className="service-icon">{s.icon}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <h2 className="section-title">Trusted by families &amp; drivers</h2>
          <p className="section-subtitle">Real stories from the people we serve.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <figure className="testimonial-card" key={t.name}>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <span className="testimonial-name">{t.name}</span>
                <span className="testimonial-role">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-subtitle">Quick answers to what people ask most.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="landing-final-cta">
        <h2>Ready when every second counts</h2>
        <p>Join thousands who trust IntelliVehicle for fast, reliable emergency transport.</p>
        <button onClick={onGetStarted} className="cta-button">
          Get Started
        </button>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/logo.png" alt="IntelliVehicle" className="footer-logo" />
            <p>Emergency ambulance, at your fingertips.</p>
          </div>
          <div className="footer-emergency">
            <span className="footer-emergency-label">Emergency numbers</span>
            <span className="footer-emergency-nums">108 · 112</span>
          </div>
        </div>
        <p className="footer-copy">© 2026 IntelliVehicle. For real emergencies, always call 108 or 112.</p>
      </footer>

      <ChatBot />
    </main>
  )
}

export default LandingPage
