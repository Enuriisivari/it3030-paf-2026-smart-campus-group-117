import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'

export default function AdminBookingsPage() {
  const [items, setItems] = useState([])
  const [reason, setReason] = useState({})

  const load = async () => {
    const res = await apiFetch('/api/bookings')
    if (res.ok) setItems(await parseJson(res))
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (id) => {
    const res = await apiFetch(`/api/bookings/${id}/approve`, { method: 'PUT' })
    if (res.ok) await load()
  }

  const reject = async (id) => {
    const res = await apiFetch(`/api/bookings/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason: reason[id] || '' }),
    })
    if (res.ok) await load()
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Admin · Booking approvals</h1>
          <p className="muted">Conflict checking runs on approve; overlapping PENDING/APPROVED slots block approval.</p>
        </div>
        <Link className="btn btn-ghost" to="/bookings">
          User view
        </Link>
      </div>

      <div className="table-wrap" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Requester</th>
              <th>Resource</th>
              <th>Slot</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>#{b.id}</td>
                <td>{b.userEmail}</td>
                <td>{b.resourceName}</td>
                <td>
                  {b.bookingDate} {b.startTime}–{b.endTime}
                </td>
                <td>{b.status}</td>
                <td>
                  {b.status === 'PENDING' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <button type="button" className="btn btn-primary" onClick={() => approve(b.id)}>
                        Approve
                      </button>
                      <input
                        className="input"
                        placeholder="Rejection reason"
                        value={reason[b.id] || ''}
                        onChange={(e) => setReason({ ...reason, [b.id]: e.target.value })}
                      />
                      <button type="button" className="btn btn-ghost" onClick={() => reject(b.id)}>
                        Reject
                      </button>
                    </div>
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
