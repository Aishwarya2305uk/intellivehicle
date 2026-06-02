import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  password: '',
  dob: '',
  gender: 'male',
  city: '',
  pincode: '',
  state: '',
}

function SignUpForm() {
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
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to sign up. Please try again.')
        return
      }
      setMessage('Signup successful. You can now log in.')
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setError('Server unavailable. Make sure the backend is running.')
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-card">
        <h1>Create your account</h1>
        <p>Complete the details below to get started.</p>
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="123-456-7890"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="dob">Date of birth</label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
            />
          </div>

          <fieldset className="field-row gender-row">
            <legend>Gender</legend>
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={form.gender === 'male'}
                onChange={handleChange}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={form.gender === 'female'}
                onChange={handleChange}
              />
              Female
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="others"
                checked={form.gender === 'others'}
                onChange={handleChange}
              />
              Others
            </label>
          </fieldset>

          <div className="field-row">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              placeholder="City"
              required
            />
          </div>

          <div className="two-column-row">
            <div className="field-row">
              <label htmlFor="pincode">Pincode</label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Postal code"
                required
              />
            </div>
            <div className="field-row">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button">
            Sign up
          </button>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </main>
  )
}

export default SignUpForm
