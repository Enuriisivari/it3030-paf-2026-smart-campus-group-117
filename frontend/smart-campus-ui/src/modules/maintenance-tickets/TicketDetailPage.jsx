import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [assignee, setAssignee] = useState('')
  const [status, setStatus] = useState('IN_PROGRESS')
  const [resolution, setResolution] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    const res = await apiFetch(`/api/tickets/${id}`)
    if (res.ok) {
      const data = await parseJson(res)
      setTicket(data)
      setStatus(data.status)
    }
    const c = await apiFetch(`/api/tickets/${id}/comments`)
    if (c.ok) setComments(await parseJson(c))
    if (isAdmin) {
      const tr = await apiFetch('/api/users/technicians')
      if (tr.ok) {
        const list = await parseJson(tr)
        setTechnicians(list)
        if (list[0]) setAssignee(String(list[0].id))
      }
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin])

  const assign = async (e) => {
    e.preventDefault()
    setError('')
    const res = await apiFetch(`/api/tickets/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ userId: String(assignee) }),
    })
    const data = await parseJson(res)
    if (!res.ok) {
      setError(data?.error || 'Assign failed')
      return
    }
    await load()
  }

  const updateStatus = async (e) => {
    e.preventDefault()
    setError('')
    const res = await apiFetch(`/api/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        resolutionNote: resolution || null,
        rejectedReason: rejectReason || null,
      }),
    })
    const data = await parseJson(res)
    if (!res.ok) {
      setError(data?.error || 'Update failed')
      return
    }
    await load()
  }

  const addComment = async (e) => {
    e.preventDefault()
    setError('')
    const res = await apiFetch(`/api/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ commentText }),
    })
    const data = await parseJson(res)
    if (!res.ok) {
      setError(data?.error || 'Comment failed')
      return
    }
    setCommentText('')
    const c = await apiFetch(`/api/tickets/${id}/comments`)
    if (c.ok) setComments(await parseJson(c))
  }

  if (!ticket) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Ticket #{ticket.id}</h1>
          <p className="muted">
            {ticket.resourceName} · {ticket.category} · {ticket.priority}
          </p>
        </div>
        <Link className="btn btn-ghost" to="/tickets">
          Back
        </Link>
      </div>

      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h2>Details</h2>
          <p>{ticket.description}</p>
          <p className="muted">Status: {ticket.status}</p>
          {ticket.resolutionNote && <p>Resolution: {ticket.resolutionNote}</p>}
          {ticket.rejectedReason && <p>Rejected: {ticket.rejectedReason}</p>}
          <h3 style={{ marginTop: '1rem' }}>Attachments</h3>
          {ticket.attachments?.length ? (
            <ul>
              {ticket.attachments.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '0.2rem 0' }}
                    onClick={async () => {
                      const res = await apiFetch(a.url)
                      if (!res.ok) return
                      const blob = await res.blob()
                      const url = URL.createObjectURL(blob)
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    {a.fileName}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No files</p>
          )}
        </div>

        <div className="card">
          <h2>Workflow</h2>
          {error && <p className="error">{error}</p>}
          {isAdmin && (
            <form onSubmit={assign} style={{ marginBottom: '1rem' }}>
              <div className="field">
                <label>Assign technician</label>
                <select className="select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  {technicians.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" type="submit">
                Assign
              </button>
            </form>
          )}
          <form onSubmit={updateStatus}>
            <div className="field">
              <label>Status</label>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div className="field">
              <label>Resolution note</label>
              <textarea className="textarea" value={resolution} onChange={(e) => setResolution(e.target.value)} />
            </div>
            <div className="field">
              <label>Rejection reason</label>
              <input className="input" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <button className="btn btn-accent" type="submit">
              Update status
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>Comments</h2>
        <form onSubmit={addComment}>
          <div className="field">
            <label>New comment</label>
            <textarea className="textarea" value={commentText} onChange={(e) => setCommentText(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit">
            Post comment
          </button>
        </form>
        <div style={{ marginTop: '1rem' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 700 }}>
                {c.userName} ·{' '}
                <span className="muted" style={{ fontWeight: 500 }}>
                  {c.createdAt}
                </span>
              </div>
              <div>{c.commentText}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
