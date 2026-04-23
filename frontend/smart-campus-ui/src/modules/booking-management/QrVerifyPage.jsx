import { useState } from 'react'
import { parseJson } from '../../api/client'

export default function QrVerifyPage() {
  const [payload, setPayload] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const verify = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    const res = await fetch('/api/bookings/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    })
    const data = await parseJson(res)
    if (!res.ok) {
      setError(data?.error || 'Verification failed')
      return
    }
    setResult(data)
  }

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 720 }}>
        <h1>Verify booking QR</h1>
        <p className="muted">Paste the decoded QR text (format: bookingId:signature). This endpoint is public for gate scanners.</p>
        <form onSubmit={verify}>
          <div className="field">
            <label>Payload</label>
            <textarea className="textarea" value={payload} onChange={(e) => setPayload(e.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-accent" type="submit">
            Verify
          </button>
        </form>
        {result && (
          <div style={{ marginTop: '1rem' }}>
            <h2>Booking #{result.id}</h2>
            <p>
              <strong>{result.resourceName}</strong>
            </p>
            <p className="muted">
              {result.bookingDate} · {result.startTime}–{result.endTime}
            </p>
            <p>Status: {result.status}</p>
            <p>Requester: {result.userEmail}</p>
          </div>
        )}
      </div>
    </div>
  )
}
