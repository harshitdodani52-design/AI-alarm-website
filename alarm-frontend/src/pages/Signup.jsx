import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { api } from '../api/client.js'

export default function Signup({ onAuthed }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.signup({ username, email, password })
      onAuthed(res.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout eyebrow="Get started" title="Create your account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <label style={labelStyle}>
          Username
          <input className="focus-ring" style={inputStyle} value={username}
                 onChange={(e) => setUsername(e.target.value)} autoFocus required />
        </label>
        <label style={labelStyle}>
          Email
          <input className="focus-ring" style={inputStyle} type="email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={labelStyle}>
          Password
          <input className="focus-ring" style={inputStyle} type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </label>

        {error && <p style={errorStyle}>{error}</p>}

        <button className="focus-ring" style={buttonStyle} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-dim)' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  fontSize: '13px',
  color: 'var(--text-dim)',
}

const inputStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 12px',
  color: 'var(--text)',
  fontSize: '15px',
}

const buttonStyle = {
  background: 'var(--accent)',
  color: 'var(--bg)',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  fontWeight: 600,
  fontSize: '15px',
  marginTop: '8px',
}

const errorStyle = {
  color: 'var(--danger)',
  fontSize: '13px',
  margin: 0,
}
