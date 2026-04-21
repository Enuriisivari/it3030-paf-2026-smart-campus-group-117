import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'

export default function BookingFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [resources, setResources] = useState([])
  const [resourceId, setResourceId] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [purpose, setPurpose] = useState('')
  const [expectedAttendees, setExpectedAttendees] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [capacity, setCapacity] = useState(null)

  const preselected = useMemo(() => {
    const rid = searchParams.get('resourceId')
    const date = searchParams.get('bookingDate')
    const start = searchParams.get('startTime')
    const end = searchParams.get('endTime')
    if (!rid || !date || !start || !end) return null
    return { rid: String(rid), date, start, end }
  }, [searchParams])

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/resources?status=ACTIVE')
      if (res.ok) {
        const data = await parseJson(res)
        setResources(data)
        if (data[0] && !preselected) setResourceId(String(data[0].id))
      }
    }
    load()
  }, [preselected])

  // Keep capacity in sync when the user changes resource manually.
  useEffect(() => {
    if (!resourceId) return
    const r = resources.find((x) => String(x.id) === String(resourceId))
    if (r && r.capacity != null) setCapacity(r.capacity)
  }, [resources, resourceId])

  useEffect(() => {
    const p = preselected
    if (!p) return

    const normalizeTime = (t) => {
      if (!t) return ''
      // Supports "HH:mm" or "HH:mm:ss"
      return String(t).slice(0, 5)
    }

    setResourceId(p.rid)
    setBookingDate(p.date)
    setStartTime(normalizeTime(p.start))
    setEndTime(normalizeTime(p.end))

    // Fetch resource capacity for the capacity warning UI.
    const loadCapacity = async () => {
      const r = await apiFetch(`/api/resources/${p.rid}`)
      if (!r.ok) return
      const data = await parseJson(r)
      setCapacity(data?.capacity ?? null)
    }
    loadCapacity()
  }, [preselected])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setOk('')

    const expected = expectedAttendees ? Number(expectedAttendees) : null
    if (capacity != null && expected != null && expected > capacity) {
      setError(`Capacity is ${capacity}. Please enter  ${capacity} or fewer attendees.`)
      return
    }

    const body = {
      resourceId: String(resourceId),
      bookingDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      purpose,
      expectedAttendees: expectedAttendees ? Number(expectedAttendees) : null,
    }
    const res = await apiFetch('/api/bookings', { method: 'POST', body: JSON.stringify(body) })
    if (!res.ok) {
      const data = await parseJson(res)
      setError(data?.error || 'Booking failed')
      return
    }
    const data = await parseJson(res)
    setOk(`Booking #${data.id} submitted for approval.`)
    navigate('/bookings/my')
  }

  const locked = Boolean(preselected)

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>New booking</h1>
          <p className="muted">Requests enter the PENDING workflow; admins approve or reject with conflict checks.</p>
        </div>
        <Link className="btn btn-ghost" to="/bookings/my">
          My bookings
        </Link>
      </div>

      <form className="card" style={{ maxWidth: 640, marginTop: '1rem' }} onSubmit={submit}>
        <div className="field">
          <label>Resource</label>
          <select
            className="select"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            required
            disabled={locked}
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.type} · {r.location}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input
            className="input"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
            disabled={locked}
          />
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label>Start</label>
            <input
              className="input"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              disabled={locked}
            />
          </div>
          <div className="field">
            <label>End</label>
            <input
              className="input"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              disabled={locked}
            />
          </div>
        </div>
        <div className="field">
          <label>Purpose</label>
          <textarea className="textarea" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
        </div>
        <div className="field">
          <label>Expected attendees</label>
          <input className="input" type="number" value={expectedAttendees} onChange={(e) => setExpectedAttendees(e.target.value)} />
          {capacity != null && expectedAttendees ? (
            Number(expectedAttendees) > capacity ? (
              <div style={{ color: 'var(--color-accent)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Capacity is {capacity}. Please enter {capacity} or fewer.
              </div>
            ) : (
              <div style={{ color: 'rgba(181, 181, 14, 0.95)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Looks good (capacity {capacity}).
              </div>
            )
          ) : null}
        </div>
        {error && <p className="error">{error}</p>}
        {ok && <p style={{ color: 'var(--color-accent)' }}>{ok}</p>}
        <button className="btn btn-primary" type="submit">
          Submit booking
        </button>
      </form>
    </div>
  )
}
