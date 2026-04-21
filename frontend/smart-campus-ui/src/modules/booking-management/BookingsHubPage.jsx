import { Link } from 'react-router-dom'

export default function BookingsHubPage() {
  return (
    <div className="page">
      <h1>Booking management</h1>
      <p className="muted">Create requests, track approvals, and verify QR payloads at access points.</p>
      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        <Link className="card" to="/facilities" style={{ display: 'block' }}>
          <h2>New booking</h2>
          <p>Choose facility and time in the new calendar flow.</p>
        </Link>
        <Link className="card" to="/bookings/my" style={{ display: 'block' }}>
          <h2>My bookings</h2>
          <p>Track status and open verification QR codes.</p>
        </Link>
        <Link className="card" to="/bookings/verify" style={{ display: 'block' }}>
          <h2>Verify QR</h2>
          <p>Validate signed payloads without signing in (gate mode).</p>
        </Link>
      </div>
    </div>
  )
}
