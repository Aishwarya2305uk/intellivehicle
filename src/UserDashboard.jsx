import { useEffect, useRef, useState } from 'react'
import './App.css'

function loadGoogleMaps(key) {
  return new Promise((resolve, reject) => {
    if (!key) return reject(new Error('No API key'))
    if (window.google && window.google.maps) return resolve(window.google.maps)
    const id = 'gmaps-script'
    if (document.getElementById(id)) {
      const check = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(check)
          resolve(window.google.maps)
        }
      }, 200)
      return
    }
    const s = document.createElement('script')
    s.id = id
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
    s.async = true
    s.onload = () => {
      if (window.google && window.google.maps) resolve(window.google.maps)
      else reject(new Error('Google maps failed to load'))
    }
    s.onerror = () => reject(new Error('Google maps failed to load'))
    document.head.appendChild(s)
  })
}

function distanceMeters(a, b) {
  if (!a || !b) return null
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const la = toRad(a.lat)
  const lb = toRad(b.lat)
  const x = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(la) * Math.cos(lb)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

export default function UserDashboard({ user, token, onBack, onAccountClick }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: '', locationText: '', lat: null, lng: null, emergencyType: 'Medical', notes: '' })
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [wsConnected, setWsConnected] = useState(false)
  const [driverLocation, setDriverLocation] = useState(null)
  const [medicalProfile, setMedicalProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medical_profile') || '{}') } catch { return {} }
  })
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('emergency_contacts') || '[]') } catch { return [] }
  })
  const [historyOpen, setHistoryOpen] = useState(false)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const wsRef = useRef(null)

  useEffect(() => {
    // load requests from API or localStorage
    async function load() {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      try {
        if (token) {
          const res = await fetch(`${API_URL}/api/ambulance-requests`, { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const data = await res.json()
            setRequests(data.requests || [])
            return
          }
        }
      } catch (e) {}
      const raw = localStorage.getItem('ambulance_requests')
      if (raw) {
        try { const all = JSON.parse(raw); setRequests(user?.email ? all.filter(r => r.userEmail === user.email) : all) } catch { setRequests([]) }
      }
    }
    load()
  }, [token, user])

  useEffect(() => {
    // WebSocket scaffolding
    const wsUrl = import.meta.env.VITE_WS_URL || (location.protocol === 'https:' ? 'wss://localhost:4000' : 'ws://localhost:4000')
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => setWsConnected(false)
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'request_update') {
            setRequests(prev => [msg.request, ...prev.filter(r => r.id !== msg.request.id)])
            setNotifications(n => [{ id: Date.now(), text: `Request ${msg.request.id} updated: ${msg.request.status}` }, ...n])
          }
          if (msg.type === 'driver_location' && msg.driverId && msg.requestId) {
            setDriverLocation({ lat: msg.lat, lng: msg.lng, driverId: msg.driverId, eta: msg.eta })
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
    return () => { if (wsRef.current) wsRef.current.close() }
  }, [])

  useEffect(() => {
    // try to initialize google maps for map picker if API key present
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY
    if (!key) return
    let maps
    let map
    loadGoogleMaps(key).then((m) => {
      maps = m
      map = new maps.Map(mapRef.current, { center: { lat: 20, lng: 0 }, zoom: 2 })
      map.addListener('click', (e) => {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        setForm(f => ({ ...f, lat, lng, locationText: `${lat.toFixed(6)}, ${lng.toFixed(6)}` }))
        if (!markerRef.current) markerRef.current = new maps.Marker({ map, position: { lat, lng } })
        else markerRef.current.setPosition({ lat, lng })
        map.panTo({ lat, lng })
      })
    }).catch(() => {})
  }, [])

  function updateForm(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function quickRequest() {
    setStatus(null)
    // try browser geolocation first
    const geo = navigator.geolocation
    let lat, lng, locText
    if (geo) {
      try {
        const pos = await new Promise((res, rej) => geo.getCurrentPosition(res, rej, { timeout: 5000 }))
        lat = pos.coords.latitude
        lng = pos.coords.longitude
        locText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        updateForm('lat', lat); updateForm('lng', lng); updateForm('locationText', locText)
      } catch (e) {
        // permission denied or timeout
      }
    }

    // build payload
    const payload = {
      id: Date.now().toString(36),
      userName: form.name || user?.name || 'Guest',
      userEmail: user?.email || null,
      phone: form.phone,
      location: form.locationText || (lat && lng ? `${lat},${lng}` : ''),
      lat: lat || form.lat,
      lng: lng || form.lng,
      emergencyType: form.emergencyType,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      status: 'requested'
    }

    // send via WebSocket if available
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'new_request', request: payload }))
        setRequests(r => [payload, ...r])
        setStatus({ ok: true, msg: 'Ambulance requested (sent via websocket).' })
        return
      }
    } catch (e) {}

    // otherwise POST to API
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    try {
      const res = await fetch(`${API_URL}/api/ambulance-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
      if (res.ok) {
        const data = await res.json()
        setRequests(r => [data.request || payload, ...r])
        setStatus({ ok: true, msg: 'Ambulance requested — help is on the way.' })
        return
      }
    } catch (e) {}

    // fallback local
    try {
      const raw = localStorage.getItem('ambulance_requests')
      const all = raw ? JSON.parse(raw) : []
      all.unshift(payload)
      localStorage.setItem('ambulance_requests', JSON.stringify(all))
      setRequests(r => [payload, ...r])
      setStatus({ ok: true, msg: 'Request saved locally (offline).' })
    } catch (e) {
      setStatus({ ok: false, msg: 'Failed to save request.' })
    }
  }

  async function sendSOS() {
    setStatus(null)
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }))
      const payload = { id: `sos-${Date.now().toString(36)}`, type: 'sos', lat: pos.coords.latitude, lng: pos.coords.longitude, time: new Date().toISOString(), user: user?.email }
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      try {
        await fetch(`${API_URL}/api/sos`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
        setStatus({ ok: true, msg: 'SOS sent to emergency services.' })
        return
      } catch (e) {}
      // fallback to websocket or local
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'sos', payload }))
        setStatus({ ok: true, msg: 'SOS sent via websocket.' })
        return
      }
      setStatus({ ok: true, msg: 'SOS saved locally.' })
    } catch (e) {
      setStatus({ ok: false, msg: 'Unable to access location for SOS.' })
    }
  }

  function saveMedicalProfile() {
    localStorage.setItem('medical_profile', JSON.stringify(medicalProfile))
    setStatus({ ok: true, msg: 'Medical profile saved.' })
  }

  function saveContacts() {
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts))
    setStatus({ ok: true, msg: 'Contacts saved.' })
  }

  function toggleDarkMode() { document.documentElement.classList.toggle('dark-mode') }

  return (
    <div className="dashboard-root" role="region" aria-label="User dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>← Back</button>
          <h1 className="dashboard-title">User Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="welcome">{user?.name || 'Guest'}</div>
          <button className="account-button" onClick={onAccountClick}>Account</button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="panel left-panel">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <button className="submit-button" style={{ padding: '18px 24px', fontSize: '1.1rem' }} onClick={quickRequest} aria-label="One-tap request ambulance">Request Ambulance — One Tap</button>
            <button className="accept" onClick={sendSOS} aria-label="Send SOS">SOS</button>
            <button className="account-button" onClick={toggleDarkMode} aria-label="Toggle dark mode">Toggle Theme</button>
          </div>

          <div className="panel-section">
            <h3>Quick Details</h3>
            <div className="field-row">
              <label>Name</label>
              <input value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Full name" />
            </div>
            <div className="two-column-row">
              <div className="field-row">
                <label>Phone</label>
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="Phone number" />
              </div>
              <div className="field-row">
                <label>Emergency Type</label>
                <select value={form.emergencyType} onChange={e => updateForm('emergencyType', e.target.value)}>
                  <option>Medical</option>
                  <option>Accident</option>
                  <option>Fire</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="field-row">
              <label>Location (automatic or click map)</label>
              <input value={form.locationText} onChange={e => updateForm('locationText', e.target.value)} placeholder="Street, city or GPS" />
            </div>
            <div className="field-row">
              <label>Notes</label>
              <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} placeholder="Additional information for drivers" />
            </div>
            {status && <p className={status.ok ? 'success-message' : 'error-message'}>{status.msg}</p>}
          </div>

          <div className="panel-section">
            <h3>Map Picker</h3>
            <div ref={mapRef} style={{ width: '100%', height: 260 }} aria-hidden={!import.meta.env.VITE_GOOGLE_MAPS_API_KEY}></div>
            <p style={{ marginTop: 8, color: '#cbd5e1' }}>Click the map to set a pin, or type an address above.</p>
          </div>

          <div className="panel-section">
            <h3>Medical Profile</h3>
            <div className="two-column-row">
              <div className="field-row">
                <label>Blood Group</label>
                <input value={medicalProfile.bloodGroup || ''} onChange={e => setMedicalProfile(p => ({ ...p, bloodGroup: e.target.value }))} />
              </div>
              <div className="field-row">
                <label>Allergies</label>
                <input value={medicalProfile.allergies || ''} onChange={e => setMedicalProfile(p => ({ ...p, allergies: e.target.value }))} />
              </div>
            </div>
            <div className="field-row">
              <label>Conditions / Medications</label>
              <textarea value={medicalProfile.conditions || ''} onChange={e => setMedicalProfile(p => ({ ...p, conditions: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="submit-button" onClick={saveMedicalProfile}>Save Profile</button>
            </div>
          </div>
        </section>

        <aside className="panel right-panel">
          <div className="panel-section">
            <h3>Notifications</h3>
            <div style={{ marginBottom: 8 }}>WS: {wsConnected ? 'Connected' : 'Disconnected'}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notifications.length === 0 && <li className="empty">No notifications</li>}
              {notifications.map(n => <li key={n.id} style={{ marginBottom: 8, color: '#cbd5e1' }}>{n.text}</li>)}
            </ul>
          </div>

          <div className="panel-section">
            <h3>Driver Tracking</h3>
            <div className="map-placeholder">
              {driverLocation ? (
                <div>
                  <div>Driver: {driverLocation.driverId}</div>
                  <div>ETA: {driverLocation.eta || (driverLocation.lat && form.lat ? `${Math.round(distanceMeters({lat: form.lat, lng: form.lng}, driverLocation)/1000)} km` : 'calculating')}</div>
                </div>
              ) : (
                <div>No driver assigned yet</div>
              )}
            </div>
          </div>

          <div className="panel-section">
            <h3>Emergency Contacts</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>{c.name} — {c.phone}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="accept" onClick={() => { navigator.clipboard?.writeText(c.phone) }}>Copy</button>
                    <button className="decline" onClick={() => { setContacts(cs => cs.filter((_, idx) => idx !== i)) }}>Remove</button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Name" aria-label="contact name" onKeyDown={(e) => { if (e.key === 'Enter') { const name = e.target.value; const phone = ''; setContacts(cs => [...cs, { name, phone }]); e.target.value = '' } }} />
                <button className="submit-button" onClick={saveContacts}>Save</button>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h3>Booking History</h3>
            <button className="account-button" onClick={() => setHistoryOpen(h => !h)}>{historyOpen ? 'Hide' : 'Show'}</button>
            {historyOpen && (
              <ul className="request-list" style={{ marginTop: 12 }}>
                {requests.map(r => (
                  <li key={r.id} className="request-card">
                    <div>
                      <div className="request-name">{r.userName}</div>
                      <div className="request-location">{r.location}</div>
                      <div className="request-meta">{new Date(r.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <button className="accept">Receipt</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel-section">
            <h3>Payments</h3>
            <div style={{ color: '#cbd5e1' }}>Add payment methods in your account.</div>
          </div>
        </aside>
      </main>
    </div>
  )
}
