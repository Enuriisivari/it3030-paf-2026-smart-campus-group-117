import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { apiFetch, parseJson } from '../../api/client'

function parseTimeToMinutes(t) {
  if (!t) return null
  const [hh, mm] = String(t).split(':')
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

function generateHalfHourSlots(availableFrom, availableTo) {
  if (availableFrom == null || availableTo == null) return []
  const start = availableFrom
  const end = availableFrom === availableTo ? availableFrom + 24 * 60 : availableTo
  if (end < start) return []

  const slots = []
  for (let m = start; m <= end; m += 30) {
    slots.push({ startMin: m, endMin: m + 30 })
    if (slots.length > 200) break
  }
  return slots
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart
}

export default function ResourceCalendarPage() {
  const { resourceId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [busySlots, setBusySlots] = useState([])
  const [error, setError] = useState('')
  const [selectedRange, setSelectedRange] = useState(null)

  const bookingDate = searchParams.get('date') || new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!resourceId) return
    const loadResource = async () => {
      const res = await apiFetch(`/api/resources/${resourceId}`)
      if (!res.ok) {
        setError('Unable to load resource detail.')
        return
      }
      setResource(await parseJson(res))
    }
    loadResource()
  }, [resourceId])

  useEffect(() => {
    if (!bookingDate) return
    const loadBusy = async () => {
      const res = await apiFetch(`/api/bookings/busy?date=${encodeURIComponent(bookingDate)}`)
      if (!res.ok) {
        setError('Unable to load busy slots.')
        return
      }
      setBusySlots(await parseJson(res))
    }
    loadBusy()
  }, [bookingDate])

  const availableFrom = parseTimeToMinutes(resource?.availableFrom)
  const availableTo = parseTimeToMinutes(resource?.availableTo)

  const slots = useMemo(() => {
    if (availableFrom == null || availableTo == null) return []
    return generateHalfHourSlots(availableFrom, availableTo)
  }, [availableFrom, availableTo])

  const busyByResource = useMemo(() => {
    const map = new Map()
    for (const b of busySlots || []) {
      const rid = String(b.resourceId)
      const bs = parseTimeToMinutes(b.startTime)
      const be = parseTimeToMinutes(b.endTime)
      if (!rid || bs == null || be == null) continue
      if (!map.has(rid)) map.set(rid, [])
      map.get(rid).push({ startMin: bs, endMin: be })
    }
    return map
  }, [busySlots])

  const resourceBusy = memoizeResourceBusy(resource?.id, busyByResource)

  const clickSlot = (idx) => {
    const slot = slots[idx]
    if (!slot) return

    const isBusy = resourceBusy.some((b) => overlaps(slot.startMin, slot.endMin, b.startMin, b.endMin))
    if (isBusy) return

    if (!selectedRange) {
      setSelectedRange({ start: idx, end: idx })
      return
    }

    // ensure selection is contiguous
    const { start, end } = selectedRange
    if (idx === end + 1) {
      setSelectedRange({ start, end: idx })
      return
    }
    if (idx === start - 1) {
      setSelectedRange({ start: idx, end })
      return
    }

    // if clicked inside existing range, collapse to that block (and allow extension)
    if (idx >= start && idx <= end) {
      setSelectedRange({ start: idx, end: idx })
      return
    }

    setSelectedRange({ start: idx, end: idx })
  }

  const slotColor = (idx) => {
    const slot = slots[idx]
    if (!slot) return 'rgba(255,255,255,0.05)'
    const isBusy = resourceBusy.some((b) => overlaps(slot.startMin, slot.endMin, b.startMin, b.endMin))
    if (isBusy) return 'rgba(255, 80, 80, 0.85)'

    if (selectedRange && idx >= selectedRange.start && idx <= selectedRange.end) {
      return 'rgba(44, 204, 96, 0.8)'
    }

    return 'rgba(0, 80, 180, 0.35)'
  }

  const selectedStartSlot = selectedRange ? slots[selectedRange.start] : null
  const selectedEndSlot = selectedRange ? slots[selectedRange.end] : null

  const onBook = () => {
    if (!resource || !selectedStartSlot || !selectedEndSlot) return

    const start = minutesToHHMM(selectedStartSlot.startMin)
    const end = minutesToHHMM(selectedEndSlot.startMin + 30)

    const params = new URLSearchParams({
      resourceId: String(resource.id),
      bookingDate,
      startTime: start,
      endTime: end,
    })
    navigate(`/bookings/new?${params.toString()}`)
  }

  if (error) {
    return (
      <div className="page">
        <h1>Resource calendar</h1>
        <p className="error">{error}</p>
        <Link className="btn btn-ghost" to="/facilities">
          Back to facilities
        </Link>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="page">
        <h1>Resource calendar</h1>
        <p>Loading…</p>
      </div>
    )
  }

  const isFullDay = availableFrom != null && availableTo != null && availableFrom === availableTo

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Calendar: {resource.name}</h1>
          <p className="muted">Click available 30-min blocks (adjacent blocks extend selection).</p>
        </div>
        <Link className="btn btn-ghost" to="/facilities">
          Back to facilities
        </Link>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <p>
          type: {resource.type} · status: {resource.status} · capacity: {resource.capacity ?? 'N/A'} · location: {resource.location}
        </p>
        <p>
          Availability: {resource.availableFrom ?? '-'} – {resource.availableTo ?? '-'}
          {isFullDay ? ' (interpreted as 24 hours)' : ''} (calendar shows 30-min marks and blocked busy slots)
        </p>
        <p>Day: {bookingDate}</p>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
            gap: '0.3rem',
          }}
        >
          {slots.map((slot, idx) => {
            const isDisabled = resourceBusy.some((b) => overlaps(slot.startMin, slot.endMin, b.startMin, b.endMin))
            const label = formatSlotLabel(slot.startMin)
            const isSelected = selectedRange && idx >= selectedRange.start && idx <= selectedRange.end

            return (
              <button
                key={idx}
                type="button"
                onClick={() => !isDisabled && clickSlot(idx)}
                disabled={isDisabled}
                style={{
                  minHeight: 44,
                  fontSize: 11,
                  color: isDisabled ? '#333' : isSelected ? '#fff' : '#fff',
                  background: slotColor(idx),
                  border: isSelected ? '2px solid #00d000' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6,
                  cursor: !isDisabled ? 'pointer' : 'not-allowed',
                }}
                aria-label={`${label}${isDisabled ? ' busy' : isSelected ? ' selected' : ' available'}`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" className="btn btn-primary" onClick={onBook} disabled={!selectedRange}>
            Book selected slots
          </button>
          {selectedRange && selectedStartSlot && selectedEndSlot && (
            <span className="muted">
              Selected from {minutesToHHMM(selectedStartSlot.startMin)} to {minutesToHHMM(selectedEndSlot.startMin + 30)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function memoizeResourceBusy(resourceId, busyByResource) {
  if (!resourceId) return []
  return busyByResource.get(String(resourceId)) || []
}
