import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'

const emptyForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: '',
  location: '',
  availableFrom: '',
  availableTo: '',
  status: 'ACTIVE',
}

function parseTimeToMinutes(t) {
  if (!t) return null
  const [hh, mm] = String(t).split(':')
  if (hh == null || mm == null) return null
  return Number(hh) * 60 + Number(mm)
}

function isWithin24Hours(fromTime, toTime) {
  if (!fromTime || !toTime) return true
  const from = parseTimeToMinutes(fromTime)
  const to = parseTimeToMinutes(toTime)
  if (from == null || to == null) return true
  
  // Calculate difference in minutes
  const diff = to - from
  
  // If to < from, it's wrap-around to next day - not allowed
  if (diff < 0) return false
  
  // Check if within 24 hours (1440 minutes)
  return diff <= 24 * 60
}

export default function AdminResourcesPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [validationError, setValidationError] = useState('')

  const load = async () => {
    const res = await apiFetch('/api/resources')
    if (res.ok) setItems(await parseJson(res))
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setValidationError('')
    
    // Validate 24-hour constraint
    if (form.availableFrom && form.availableTo) {
      if (!isWithin24Hours(form.availableFrom, form.availableTo)) {
        setValidationError('Available to must be within 24 hours from available from.')
        return
      }
    }
    
    const body = {
      name: form.name,
      type: form.type,
      capacity: form.capacity ? Number(form.capacity) : null,
      location: form.location,
      availableFrom: form.availableFrom || null,
      availableTo: form.availableTo || null,
      status: form.status,
    }
    const res = editingId
      ? await apiFetch(`/api/resources/${editingId}`, { method: 'PUT', body: JSON.stringify(body) })
      : await apiFetch('/api/resources', { method: 'POST', body: JSON.stringify(body) })
    const data = await parseJson(res)
    if (!res.ok) {
      setError(data?.error || 'Save failed')
      return
    }
    setForm(emptyForm)
    setEditingId(null)
    await load()
  }

  const edit = (r) => {
    setEditingId(r.id)
    setForm({
      name: r.name,
      type: r.type,
      capacity: r.capacity ?? '',
      location: r.location,
      availableFrom: r.availableFrom ?? '',
      availableTo: r.availableTo ?? '',
      status: r.status,
    })
  }

  const remove = async (id) => {
    if (!confirm('Delete this resource?')) return
    setError('')
    try {
      const res = await apiFetch(`/api/resources/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await parseJson(res)
        setError(data?.error || 'Delete failed')
        return
      }
      await load()
    } catch (err) {
      setError('Delete error: ' + (err?.message || 'Unknown error'))
    }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Admin · Resources</h1>
          <p className="muted">Create, update, and retire campus resources.</p>
        </div>
        <Link className="btn btn-ghost" to="/facilities">
          View public list
        </Link>
      </div>

      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        <form className="card" onSubmit={submit}>
          <h2>{editingId ? `Edit #${editingId}` : 'New resource'}</h2>
          {error && <p className="error">{error}</p>}
          {validationError && <p className="error">{validationError}</p>}
          <div className="field">
            <label>Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Type</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="LECTURE_HALL">LECTURE_HALL</option>
              <option value="LAB">LAB</option>
              <option value="MEETING_ROOM">MEETING_ROOM</option>
              <option value="PROJECTOR">PROJECTOR</option>
              <option value="CAMERA">CAMERA</option>
              <option value="WHITE_BOARD">WHITE_BOARD</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
            </select>
          </div>
          <div className="field">
            <label>Capacity</label>
            <input className="input" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div className="field">
            <label>Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ color: 'red', fontSize: '0.85rem', margin: 0 }}>Use 24-hour clock (00:00–23:59)</p>
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Available from</label>
              <input className="input" type="time" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
            </div>
            <div className="field">
              <label>Available to</label>
              <input className="input" type="time" value={form.availableTo} onChange={(e) => setForm({ ...form, availableTo: e.target.value })} />
              <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Must be within 24 hours from available from.</p>
            </div>
          </div>
          <div className="field">
            <label>Status</label>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={validationError ? true : false}>
              {editingId ? 'Save changes' : 'Create resource'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                  setValidationError('')
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <h2>Existing resources</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.type}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => edit(r)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
