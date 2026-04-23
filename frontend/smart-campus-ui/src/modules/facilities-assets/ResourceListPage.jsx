import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

function parseTimeToMinutes(t) {
  if (!t) return null
  const s = String(t)
  const [hh, mm] = s.split(':')
  if (hh == null || mm == null) return null
  return Number(hh) * 60 + Number(mm)
}

function minutesToHHMM(mins) {
  const hh = Math.floor(mins / 60)
  const mm = mins % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function formatSlotLabel(mins) {
  const normalized = mins % (24 * 60)
  const hh24 = Math.floor(normalized / 60)
  const mm = normalized % 60
  return `${String(hh24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function hourRoundDown(mins) {
  return Math.floor(mins / 60) * 60
}

function hourRoundUp(mins) {
  return Math.ceil(mins / 60) * 60
}

function generateHourSlots(startMins, endMins) {
  const slots = []
  const start = Math.max(0, startMins)
  const end = Math.min(24 * 60, endMins)
  for (let m = start; m + 60 <= end; m += 60) {
    slots.push({
      startMin: m,
      endMin: m + 60,
      startHHMM: minutesToHHMM(m),
      endHHMM: minutesToHHMM(m + 60),
    })
  }
  return slots
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  // [aStart,aEnd) overlaps [bStart,bEnd)
  return aStart < bEnd && aEnd > bStart
}

export default function ResourceListPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [busy, setBusy] = useState([])

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('')
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10))

  const query = useMemo(() => {
    const p = new URLSearchParams()
    if (name) p.set('name', name)
    if (type) p.set('type', type)
    if (location) p.set('location', location)
    if (status) p.set('status', status)
    return p.toString()
  }, [name, type, location, status])

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch(`/api/resources${query ? `?${query}` : ''}`)
      if (res.ok) setItems(await parseJson(res))
    }
    load()
  }, [query])

  useEffect(() => {
    const loadBusy = async () => {
      const res = await apiFetch(`/api/bookings/busy?date=${encodeURIComponent(day)}`)
      if (!res.ok) return
      setBusy(await parseJson(res))
    }
    loadBusy()
  }, [day])

  const openCalendar = (resource) => {
    navigate(`/facilities/${resource.id}/calendar?date=${day}`)
  }

  const busyByResource = useMemo(() => {
    const map = new Map()
    for (const b of busy || []) {
      const rid = String(b.resourceId)
      const bs = parseTimeToMinutes(b.startTime)
      const be = parseTimeToMinutes(b.endTime)
      if (bs == null || be == null) continue
      if (!map.has(rid)) map.set(rid, [])
      map.get(rid).push({ startMin: bs, endMin: be })
    }
    return map
  }, [busy])

  const timeBounds = useMemo(() => {
    let min = null
    let max = null
    for (const r of items) {
      const af = parseTimeToMinutes(r.availableFrom)
      const at = parseTimeToMinutes(r.availableTo)
      if (af == null || at == null) continue
      if (min == null) min = af
      else min = Math.min(min, af)
      if (max == null) max = at
      else max = Math.max(max, at)
    }
    if (min == null || max == null || min === max) return { startMin: 8 * 60, endMin: 18 * 60 }
    return { startMin: hourRoundDown(min), endMin: hourRoundUp(max) }
  }, [items])

  const slots = useMemo(() => generateHourSlots(timeBounds.startMin, timeBounds.endMin), [timeBounds])

  const resourceTypeOptions = [
    'LECTURE_HALL',
    'LAB',
    'MEETING_ROOM',
    'PROJECTOR',
    'CAMERA',
    'WHITE_BOARD',
    'EQUIPMENT',
  ]

  const setSelection = (resourceId, startIndex, endIndex) => {
    const a = Math.min(startIndex, endIndex)
    const b = Math.max(startIndex, endIndex)
    setSelectedByResource((prev) => ({ ...prev, [resourceId]: { startIndex: a, endIndex: b } }))
  }

  const handleSlotClick = (r, index) => {
    const rid = String(r.id)
    const isActive = r.status === 'ACTIVE'
    if (!isActive) return

    const af = parseTimeToMinutes(r.availableFrom)
    const at = parseTimeToMinutes(r.availableTo)
    if (af == null || at == null) return

    const slot = slots[index]
    if (!slot) return

    // Outside facility window is not selectable.
    if (slot.startMin < af || slot.endMin > at) return

    // Busy means not selectable.
    const busyIntervals = busyByResource.get(String(r.id)) || []
    const isBusy = busyIntervals.some((x) => overlaps(slot.startMin, slot.endMin, x.startMin, x.endMin))
    if (isBusy) return

    const existing = selectedByResource[rid]
    if (!existing) {
      setSelection(rid, index, index)
      return
    }

    if (index === existing.endIndex + 1) {
      setSelection(rid, existing.startIndex, index)
      return
    }
    if (index + 1 === existing.startIndex) {
      setSelection(rid, index, existing.endIndex)
      return
    }

    // If not adjacent, restart selection at the clicked slot.
    setSelection(rid, index, index)
  }

  const handleBook = (r) => {
    const sel = selectedByResource[String(r.id)]
    if (!sel) return
    const startSlot = slots[sel.startIndex]
    const endSlot = slots[sel.endIndex]
    if (!startSlot || !endSlot) return

    const params = new URLSearchParams({
      resourceId: String(r.id),
      bookingDate: day,
      startTime: startSlot.startHHMM,
      endTime: endSlot.endHHMM,
    })
    navigate(`/bookings/new?${params.toString()}`)
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <h1>Facilities & assets</h1>
          <p className="muted" style={{ marginBottom: 0 }}>
            Pick a facility, select consecutive available slots, and book your time window.
          </p>
        </div>
        {isAdmin && (
          <Link className="btn btn-primary" to="/admin/resources">
            Manage resources
          </Link>
        )}
      </div>

      <div className="card" style={{ marginTop: '1rem', padding: '0.9rem 1rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div className="field" style={{ marginBottom: 0, minWidth: 220 }}>
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hall A" />
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 160 }}>
            <label>Type</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Any</option>
              {resourceTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
            <label>Location</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Building" />
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 160 }}>
            <label>Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Day</label>
            <input className="input" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }} className="grid">
        {items.length === 0 && <p className="muted">No facilities found for your filters.</p>}

        {items.map((r) => {
          const af = parseTimeToMinutes(r.availableFrom)
          const at = parseTimeToMinutes(r.availableTo)
          const isFullDay = af != null && at != null && af === at
          const effectiveFrom = isFullDay ? 0 : af
          const effectiveTo = isFullDay ? 24 * 60 : at

          return (
            <div key={r.id} className="card" style={{ padding: '1rem 1.05rem' }}>
              <h2 style={{ marginBottom: '0.25rem', fontSize: '1.15rem' }}>{r.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge badge-ok" style={{ background: 'rgba(11, 40, 138, 0.35)' }}>
                  {r.type}
                </span>
                <span className={r.status === 'ACTIVE' ? 'badge badge-ok' : 'badge badge-bad'}>{r.status}</span>
                {r.capacity != null ? <span className="muted">Capacity: {r.capacity}</span> : null}
                {r.location ? <span className="muted">{r.location}</span> : null}
              </div>
              {af != null && at != null ? (
                <div className="muted" style={{ marginTop: '0.35rem' }}>
                  Availability: {minutesToHHMM(af)} – {minutesToHHMM(at)}{af === at ? ' (24 hours)' : ''}
                </div>
              ) : (
                <div className="muted" style={{ marginTop: '0.35rem' }}>
                  Availability hours not set.
                </div>
              )}
              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => openCalendar(r)}
                  disabled={r.status !== 'ACTIVE'}
                >
                  Open calendar
                </button>
                <span className="muted">
                  {r.status === 'ACTIVE' ? 'Click to select 30-minute blocks for this resource.' : 'Resource is out of service.'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
