import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  const facilities = [
    { label: 'Lecture halls', tone: 'ok' },
    { label: 'Labs', tone: 'ok' },
    { label: 'Meeting rooms', tone: 'ok' },
    { label: 'Projectors', tone: 'accent' },
    { label: 'Cameras', tone: 'accent' },
    { label: 'White boards', tone: 'accent' },
    { label: 'General equipment', tone: 'accent' },
  ]

  return (
    <div className="page" style={{ maxWidth: '100vw', margin: 0, padding: 0 }}>
      {/* Hero section with full width resource animation */}
      <div className="card" style={{ padding: '3rem 2.2rem', position: 'relative', overflow: 'hidden', width: '100vw', borderRadius: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'absolute',
            inset: -120,
            background:
              'radial-gradient(450px 220px at 15% 20%, rgba(11, 40, 138, 0.55), transparent 60%), radial-gradient(360px 200px at 90% 20%, rgba(181, 181, 14, 0.18), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
          Manage All Resources <span style={{ color: 'var(--color-accent)' }}>HERE</span>
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', height: '200px', alignItems: 'center' }}>
            <svg width="300" height="200" viewBox="0 0 300 200" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>
              {/* Connection lines */}
              <g id="lines">
                <line className="connection-line line-1" x1="60" y1="138" x2="60" y2="80" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="5,5" />
                <line className="connection-line line-2" x1="150" y1="158" x2="150" y2="50" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="5,5" />
                <line className="connection-line line-3" x1="240" y1="138" x2="240" y2="80" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="5,5" />
              </g>
              
              {/* Resource boxes */}
              <g id="resources">
                <rect className="resource-box resource-1" x="30" y="30" width="60" height="50" rx="8" fill="rgba(11, 40, 138, 0.1)" stroke="var(--color-primary)" strokeWidth="2" />
                <text x="60" y="62" textAnchor="middle" fontSize="12" fill="var(--color-primary)" fontWeight="bold">Lab</text>
                
                <rect className="resource-box resource-2" x="120" y="0" width="60" height="50" rx="8" fill="rgba(181, 181, 14, 0.1)" stroke="var(--color-accent)" strokeWidth="2" />
                <text x="150" y="32" textAnchor="middle" fontSize="12" fill="var(--color-accent)" fontWeight="bold">Hall</text>
                
                <rect className="resource-box resource-3" x="210" y="30" width="60" height="50" rx="8" fill="rgba(11, 40, 138, 0.1)" stroke="var(--color-primary)" strokeWidth="2" />
                <text x="240" y="62" textAnchor="middle" fontSize="12" fill="var(--color-primary)" fontWeight="bold">Room</text>
              </g>
              
              {/* People circles */}
              <g id="people">
                <circle className="person person-1" cx="60" cy="150" r="12" fill="var(--color-primary)" opacity="0.8" />
                <text x="60" y="155" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">👤</text>
                
                <circle className="person person-2" cx="150" cy="170" r="12" fill="var(--color-accent)" opacity="0.8" />
                <text x="150" y="175" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">👤</text>
                
                <circle className="person person-3" cx="240" cy="150" r="12" fill="var(--color-primary)" opacity="0.8" />
                <text x="240" y="155" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">👤</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Content section with description, badges, and button */}
      <div className="card" style={{ padding: '3rem 2.2rem', position: 'relative', overflow: 'hidden', width: '100%', marginTop: '1.5rem' }}>
        <div
          style={{
            position: 'absolute',
            inset: -120,
            background:
              'radial-gradient(450px 220px at 15% 20%, rgba(11, 40, 138, 0.55), transparent 60%), radial-gradient(360px 200px at 90% 20%, rgba(181, 181, 14, 0.18), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>
          <p className="muted" style={{ maxWidth: '100%', marginBottom: '1.5rem', textAlign: 'center' , fontSize: '1.25rem' }}>
            Reserve rooms and equipment with conflict-aware scheduling. Select a time window, submit your request, and use the QR
            verification at access points.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {facilities.map((f) => (
              <span
                key={f.label}
                className={f.tone === 'ok' ? 'badge badge-ok' : 'badge badge-pending'}
                style={{ borderRadius: 999 }}
              >
                {f.label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            {user ? (
              <Link className="btn btn-primary" to="/facilities" style={{ padding: '1.25rem 2rem', fontSize: '1.25rem', minWidth: '240px' }}>
                Browse facilities
              </Link>
            ) : (
              <Link className="btn btn-primary" to="/login" style={{ padding: '1.25rem 2rem', fontSize: '1.25rem', minWidth: '240px' }}>
                Sign in to browse
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
