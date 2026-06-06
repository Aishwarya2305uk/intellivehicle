import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const initialForm = {
  name: '',
  phone: '',
  address: '',
  email: '',
  password: '',
}

function DriverSignUpForm() {
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/driver-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to register. Please try again.')
        return
      }
      setMessage('Driver registration successful. You can now log in.')
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setError('Server unavailable. Make sure the backend is running.')
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-card">
        <h1>Register as a driver</h1>
        <p>Complete your details to join our driver network.</p>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label htmlFor="driver-name">Full name</label>
            <input
              id="driver-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="driver-phone">Phone number</label>
            <input
              id="driver-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="123-456-7890"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="driver-address">Address</label>
            <textarea
              id="driver-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your full address"
              rows="3"
              required
              style={{
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '16px',
                padding: '14px 16px',
                fontSize: '1rem',
                color: '#f8fafc',
                background: 'rgba(255, 255, 255, 0.06)',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.04)',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <div className="field-row">
            <label htmlFor="driver-email">Email address</label>
            <input
              id="driver-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="driver-password">Password</label>
            <input
              id="driver-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Register as driver
          </button>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </main>
  )
}

export default DriverSignUpForm
