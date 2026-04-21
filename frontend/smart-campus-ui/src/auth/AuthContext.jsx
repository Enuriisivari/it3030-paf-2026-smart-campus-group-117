import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, getToken, parseJson, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    const res = await apiFetch('/api/users/me')
    if (!res.ok) {
      setUser(null)
      setLoading(false)
      return
    }
    const data = await parseJson(res)
    setUser(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const onAuth = () => refresh()
    window.addEventListener('smart-campus:auth', onAuth)
    return () => window.removeEventListener('smart-campus:auth', onAuth)
  }, [refresh])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    window.dispatchEvent(new CustomEvent('smart-campus:auth'))
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout,
      isAdmin: user?.role === 'ADMIN',
      isTechnician: user?.role === 'TECHNICIAN',
    }),
    [user, loading, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
