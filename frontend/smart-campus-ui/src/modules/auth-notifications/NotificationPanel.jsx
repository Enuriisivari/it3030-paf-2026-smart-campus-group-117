import { useEffect, useRef, useState } from 'react'
import { apiFetch, parseJson } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function NotificationPanel() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const res = await apiFetch('/api/notifications')
      if (res.ok) setItems(await parseJson(res))
      setLoading(false)
    }
    load()
    const id = setInterval(load, 45000)
    return () => clearInterval(id)
  }, [user, open])

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const unread = items.filter((n) => !n.read).length

  const markRead = async (id) => {
    const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' })
    if (res.ok) {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)))
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen((v) => !v)}>
        Alerts {unread > 0 ? <span className="badge badge-pending">{unread}</span> : null}
      </button>
      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            width: 360,
            maxHeight: 420,
            overflow: 'auto',
            zIndex: 50,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <strong>Notifications</strong>
            {loading && <span className="muted">Updating…</span>}
          </div>
          {items.length === 0 && <p className="muted">No notifications yet.</p>}
          {items.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '0.65rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                opacity: n.read ? 0.65 : 1,
              }}
            >
              <div style={{ fontWeight: 700 }}>{n.title}</div>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {n.message}
              </div>
              {!n.read && (
                <button type="button" className="btn btn-ghost" style={{ marginTop: '0.35rem' }} onClick={() => markRead(n.id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
