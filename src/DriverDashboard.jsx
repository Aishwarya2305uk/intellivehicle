import { useEffect, useState } from 'react'
import './App.css'

export default function DriverDashboard({ onBack, user: initialUser, token, onAccountClick }) {
  const [user, setUser] = useState(initialUser || null)
  const [available, setAvailable] = useState(true)

  const [requests, setRequests] = useState([
    { id: 1, name: 'Mary K.', location: '12 Oak St, Springfield', phone: '+1 555-1234', priority: 'High' },
    { id: 2, name: 'John R.', location: '45 Pine Ave, Riverside', phone: '+1 555-9876', priority: 'Medium' },
    { id: 3, name: 'Lara P.', location: '88 Lakeview Dr, Baytown', phone: '+1 555-2222', priority: 'Low' },
  ])

  const handleAccept = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    // In a real app we'd call an API and update the request state
  }

  const handleDecline = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  useEffect(() => {
    async function loadMe() {
      if (user) return
      const t = token || localStorage.getItem('token')
      if (!t) return
      try {
        const res = await fetch('http://localhost:4000/api/me', { headers: { Authorization: `Bearer ${t}` } })
        if (!res.ok) return
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error('Failed to load user', err)
      }
    }
    loadMe()
  }, [token, user])

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>← Back</button>
          <h2 className="dashboard-title">Driver Dashboard</h2>
        </div>

        <div className="header-right">
          <div className="welcome">Welcome, <strong>{user ? user.name : 'Driver'}</strong></div>
          <button className="account-button" onClick={() => onAccountClick && onAccountClick()}>{'Account'}</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="panel left-panel">
          <div className="panel-section">
            <h3>Status</h3>
            <div className="status-row">
              <label className="switch">
                <input type="checkbox" checked={available} onChange={() => setAvailable((v) => !v)} />
                <span className="slider" />
              </label>
              <div className="status-text">{available ? 'Available' : 'Unavailable'}</div>
            </div>
          </div>

          <div className="panel-section">
            <h3>Incoming Requests</h3>
            {requests.length === 0 && <p className="empty">No incoming requests right now.</p>}

            <ul className="request-list">
              {requests.map((r) => (
                <li key={r.id} className={`request-card priority-${r.priority.toLowerCase()}`}>
                  <div className="request-info">
                    <div className="request-name">{r.name}</div>
                    <div className="request-location">{r.location}</div>
                    <div className="request-phone">{r.phone}</div>
                  </div>
                  <div className="request-actions">
                    <div className="priority">{r.priority}</div>
                    <button className="accept" onClick={() => handleAccept(r.id)}>Accept</button>
                    <button className="decline" onClick={() => handleDecline(r.id)}>Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="panel right-panel">
          <div className="panel-section">
            <h3>Account Details</h3>
            {user ? (
              <dl className="info-list">
                <div>
                  <dt>Name</dt>
                  <dd>{user.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{user.phone}</dd>
                </div>
                <div>
                  <dt>City</dt>
                  <dd>{user.city}</dd>
                </div>
              </dl>
            ) : (
              <p className="empty">Loading account details…</p>
            )}
          </div>

          <div className="panel-section">
            <h3>Map</h3>
            <div className="map-placeholder">Map view placeholder</div>
          </div>
        </aside>
      </main>
    </div>
  )
}
