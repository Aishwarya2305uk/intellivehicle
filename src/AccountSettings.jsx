import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Map an account object to the editable form fields for its role.
function toForm(account) {
  return {
    name: account?.name || '',
    phone: account?.phone || '',
    address: account?.address || '',
    city: account?.city || '',
    pincode: account?.pincode || '',
    state: account?.state || '',
    dob: account?.dob || '',
    gender: account?.gender || '',
  }
}

export default function AccountSettings({ token, initialUser, onSaved, onBack }) {
  const [user, setUser] = useState(initialUser || null)
  const [role, setRole] = useState(initialUser?.role || 'user')
  const [form, setForm] = useState(toForm(initialUser))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const t = token || localStorage.getItem('token')
    if (!t) {
      if (user) {
        setRole(user.role || 'user')
        setForm(toForm(user))
      }
      return
    }

    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/me`, { headers: { Authorization: `Bearer ${t}` } })
        if (!res.ok) {
          throw new Error('Unable to fetch')
        }
        const data = await res.json()
        setUser(data.user)
        setRole(data.user.role || 'user')
        setForm(toForm(data.user))
      } catch (err) {
        console.error(err)
        setError('Unable to load account details.')
      }
    }

    load()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const t = token || localStorage.getItem('token')
      if (!t) throw new Error('Not authenticated')
      const res = await fetch(`${API_URL}/api/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Update failed')
        return
      }
      setMessage('Account updated.')
      setUser(data.user)
      if (typeof onSaved === 'function') onSaved(data.user)
    } catch (err) {
      console.error(err)
      setError('Unable to save changes.')
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-card" style={{ maxWidth: 700 }}>
        <h1>Account Settings</h1>
        <p>Update your account details below.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="field-row">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>

          {role === 'driver' ? (
            <div className="field-row">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  fontSize: '1rem',
                  color: '#f8fafc',
                  background: 'rgba(255, 255, 255, 0.06)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          ) : (
            <>
              <div className="two-column-row">
                <div className="field-row">
                  <label>City</label>
                  <input name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="field-row">
                  <label>Pincode</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} />
                </div>
              </div>

              <div className="field-row">
                <label>State</label>
                <input name="state" value={form.state} onChange={handleChange} />
              </div>

              <div className="two-column-row">
                <div className="field-row">
                  <label>Date of Birth</label>
                  <input name="dob" type="date" value={form.dob || ''} onChange={handleChange} />
                </div>
                <div className="field-row">
                  <label>Gender</label>
                  <select name="gender" value={form.gender || ''} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="submit-button">Save changes</button>
            <button type="button" className="back-button" onClick={onBack}>Cancel</button>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </main>
  )
}
