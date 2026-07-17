import { useEffect, useState } from 'react'
import './App.css'
import LandingPage from './LandingPage.jsx'
import LoginForm from './LoginForm.jsx'
import SignUpForm from './SignUpForm.jsx'
import DriverSignUpForm from './DriverSignUpForm.jsx'
import DriverDashboard from './DriverDashboard.jsx'
import AccountSettings from './AccountSettings.jsx'
import UserDashboard from './UserDashboard.jsx'

function App() {
  const [page, setPage] = useState('landing')
  const [mode, setMode] = useState('signup')
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function loadUser() {
      if (user) return
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        const res = await fetch(`${API_URL}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        setUser(data.user)
      } catch (err) {
        console.error('Auto-login failed', err)
      }
    }
    loadUser()
  }, [user])

  const handleGetStarted = () => {
    setPage('auth')
  }

  const handleBackToHome = () => {
    setPage('landing')
    setMode('signup')
  }

  // Route a logged-in account to the dashboard that matches its role.
  const dashboardPageFor = (account) =>
    account && account.role === 'driver' ? 'driver-dashboard' : 'user-dashboard'

  const goToDashboard = (account) => {
    setUser(account)
    setPage(dashboardPageFor(account))
  }

  if (page === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  if (page === 'driver-dashboard') {
    return <DriverDashboard onBack={() => setPage('auth')} user={user} token={localStorage.getItem('token')} onAccountClick={() => setPage('account')} />
  }

  if (page === 'user-dashboard') {
    return <UserDashboard onBack={() => setPage('auth')} user={user} token={localStorage.getItem('token')} onAccountClick={() => setPage('account')} />
  }

  if (page === 'account') {
    return (
      <AccountSettings
        token={localStorage.getItem('token')}
        initialUser={user}
        onSaved={(u) => goToDashboard(u)}
        onBack={() => setPage(dashboardPageFor(user))}
      />
    )
  }

  return (
    <div className="app-shell">
      <nav className="auth-nav">
        <button
          type="button"
          className="back-button"
          onClick={handleBackToHome}
        >
          ← Back
        </button>
        <button
          type="button"
          className={mode === 'signup' ? 'active' : ''}
          onClick={() => setMode('signup')}
        >
          User Sign Up
        </button>
        <button
          type="button"
          className={mode === 'driver-signup' ? 'active' : ''}
          onClick={() => setMode('driver-signup')}
        >
          Driver Sign Up
        </button>
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        {user && (
          <button
            type="button"
            onClick={() => setPage(dashboardPageFor(user))}
          >
            {user.role === 'driver' ? 'Driver Dashboard' : 'User Dashboard'}
          </button>
        )}
      </nav>

      {mode === 'signup' && <SignUpForm />}
      {mode === 'driver-signup' && <DriverSignUpForm />}
      {mode === 'login' && <LoginForm onLogin={(u) => goToDashboard(u)} />}
    </div>
  )
}

export default App
