import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setToken } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [msg, setMsg] = useState('Completing sign-in…')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setMsg('Missing token. Return to login.')
      return
    }
    setToken(token)
    refresh().then(() => navigate('/'))
  }, [params, navigate, refresh])

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520 }}>
        <h1>Authentication</h1>
        <p>{msg}</p>
      </div>
    </div>
  )
}
