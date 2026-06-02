import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Login failed.')
        return
      }

      setMessage(`Welcome back, ${data.user.name}!`)
      setForm({ email: '', password: '' })
    } catch (err) {
      console.error(err)
      setError('Unable to reach the server. Check that the backend is running.')
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-card">
        <h1>Login to your account</h1>
        <p>Enter your registered email and password.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="field-row">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Login
          </button>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </main>
  )
}

export default LoginForm
