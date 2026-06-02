import { useState } from 'react'
import './App.css'
import LoginForm from './LoginForm.jsx'
import SignUpForm from './SignUpForm.jsx'

function App() {
  const [mode, setMode] = useState('signup')

  return (
    <div className="app-shell">
      <nav className="auth-nav">
        <button
          type="button"
          className={mode === 'signup' ? 'active' : ''}
          onClick={() => setMode('signup')}
        >
          Sign Up
        </button>
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Login
        </button>
      </nav>

      {mode === 'signup' ? <SignUpForm /> : <LoginForm />}
    </div>
  )
}

export default App
