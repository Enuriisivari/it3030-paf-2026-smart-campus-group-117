import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'

export default function TicketCreatePage() {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [resourceId, setResourceId] = useState('')
  const [category, setCategory] = useState('HVAC')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/resources')
      if (res.ok) {
        const data = await parseJson(res)
        setResources(data)
        if (data[0]) setResourceId(String(data[0].id))
      }
    }
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    fd.append('resourceId', resourceId)
    fd.append('category', category)
    fd.append('description', description)
    fd.append('priority', priority)
    files.forEach((f) => fd.append('files', f))
    const res = await apiFetch('/api/tickets', { method: 'POST', body: fd })
    const data = await parseJson(res)
    if (!res.ok) {
      setError(data?.error || 'Failed to create ticket')
      return
    }
    navigate(`/tickets/${data.id}`)
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Report maintenance</h1>
          <p className="muted">Attach photos or documents; technicians collaborate via assignment and comments.</p>
        </div>
        <Link className="btn btn-ghost" to="/tickets">
          Ticket dashboard
        </Link>
      </div>

      <form className="card" style={{ maxWidth: 720, marginTop: '1rem' }} onSubmit={submit}>
        <div className="field">
          <label>Resource</label>
          <select className="select" value={resourceId} onChange={(e) => setResourceId(e.target.value)} required>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.location}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Category</label>
          <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="field">
          <label>Priority</label>
          <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
        <div className="field">
          <label>Attachments</label>
          <input className="input" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        </div>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit">
          Submit ticket
        </button>
      </form>
    </div>
  )
}
