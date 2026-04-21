import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, parseJson, setToken } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [email, setEmail] = useState('admin@campus.edu')
  const [fullName, setFullName] = useState('Campus Admin')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const startGoogle = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  const devLogin = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const body = { email, fullName }
    if (role) {
      body.role = role
    }
    const res = await apiFetch('/api/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const data = await parseJson(res)
    if (!res.ok) {
      setError(data?.error || 'Dev login failed')
      setBusy(false)
      return
    }
    setToken(data.token)
    await refresh()
    navigate('/')
    setBusy(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #040c33 0%, #030b18 45%, #000000 100%)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '450px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 24px 50px rgba(0,0,0,0.35)', padding: '2.4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: '#0f113a' }}>Welcome back</h1>
        <p style={{ color: '#2f356a', marginBottom: '1.4rem', fontSize: '1.05rem', lineHeight: 1.4 }}>
          Sign up from your Google account to proceed to booking system
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={startGoogle}
          style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', fontWeight: 700 }}
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
