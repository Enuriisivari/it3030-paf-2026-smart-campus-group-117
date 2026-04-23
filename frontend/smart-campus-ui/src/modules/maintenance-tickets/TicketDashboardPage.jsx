import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'

function badge(status) {
  if (status === 'OPEN') return 'badge badge-pending'
  if (status === 'IN_PROGRESS') return 'badge badge-ok'
  if (status === 'RESOLVED' || status === 'CLOSED') return 'badge badge-ok'
  if (status === 'REJECTED') return 'badge badge-bad'
  return 'badge badge-ok'
}

export default function TicketDashboardPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/tickets')
      if (res.ok) setItems(await parseJson(res))
    }
    load()
  }, [])

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Maintenance & tickets</h1>
          <p className="muted">Technicians see assigned work; users see tickets they opened.</p>
        </div>
        <Link className="btn btn-primary" to="/tickets/new">
          New ticket
        </Link>
      </div>

      <div className="table-wrap" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Resource</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>{t.resourceName}</td>
                <td>{t.category}</td>
                <td>{t.priority}</td>
                <td>
                  <span className={badge(t.status)}>{t.status}</span>
                </td>
                <td>{t.assignedToName || '—'}</td>
                <td>
                  <Link className="btn btn-ghost" to={`/tickets/${t.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
