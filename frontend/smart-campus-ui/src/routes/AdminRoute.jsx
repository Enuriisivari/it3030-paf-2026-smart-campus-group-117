import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="page">
        <p>Loading session…</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  return children
}
