import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'

async function openQrPng(bookingId) {
  const res = await apiFetch(`/api/bookings/${bookingId}/qr`)
  if (!res.ok) return
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
}

function badge(status) {
  if (status === 'APPROVED') return 'badge badge-ok'
  if (status === 'PENDING') return 'badge badge-pending'
  if (status === 'REJECTED') return 'badge badge-bad'
  return 'badge badge-ok'
}

export default function MyBookingsPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/bookings/my')
      if (res.ok) setItems(await parseJson(res))
    }
    load()
  }, [])

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>My bookings</h1>
          <p className="muted">Download a QR for approved slots to verify at the gate.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/facilities">
            New booking
          </Link>
          <Link className="btn btn-ghost" to="/bookings/verify">
            Verify QR
          </Link>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Resource</th>
              <th>When</th>
              <th>Status</th>
              <th>QR</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>
                  <div style={{ fontWeight: 700 }}>{b.resourceName}</div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {b.purpose}
                  </div>
                </td>
                <td>
                  {b.bookingDate} · {b.startTime}–{b.endTime}
                </td>
                <td>
                  <span className={badge(b.status)}>{b.status}</span>
                  {b.rejectionReason && (
                    <div className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {b.rejectionReason}
                    </div>
                  )}
                </td>
                <td>
                  {b.status === 'APPROVED' || b.status === 'PENDING' ? (
                    <button type="button" className="btn btn-ghost" onClick={() => openQrPng(b.id)}>
                      Open QR
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
