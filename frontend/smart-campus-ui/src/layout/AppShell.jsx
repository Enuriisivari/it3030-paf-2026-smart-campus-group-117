import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import NotificationPanel from '../modules/auth-notifications/NotificationPanel'

const navLinkStyle = ({ isActive }) => ({
  padding: '0.45rem 0.75rem',
  borderRadius: 10,
  border: '1px solid transparent',
  fontWeight: 600,
  fontSize: '0.92rem',
  color: 'rgba(255,255,255,0.78)',
  background: isActive ? 'rgba(11, 40, 138, 0.45)' : 'transparent',
  borderColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
})

export default function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(12px)',
          background: 'rgba(0,0,0,0.55)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Smart Campus <span style={{ color: 'var(--color-accent)' }}>Hub</span>
          </Link>
          <nav style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', flex: 1 }}>
            <NavLink to="/facilities" style={navLinkStyle}>
              Facilities
            </NavLink>
            <NavLink to="/bookings/my" style={navLinkStyle}>
              Bookings
            </NavLink>
            <NavLink to="/tickets" style={navLinkStyle}>
              Tickets
            </NavLink>
            {user?.role === 'ADMIN' && (
              <>
                <NavLink to="/admin/resources" style={navLinkStyle}>
                  Admin · Resources
                </NavLink>
                <NavLink to="/admin/bookings" style={navLinkStyle}>
                  Admin · Approvals
                </NavLink>
              </>
            )}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {user && <NotificationPanel />}
            {user && (
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {user.fullName}
              </span>
            )}
            {user ? (
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Sign out
              </button>
            ) : (
              <Link className="btn btn-primary" to="/login">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem' }}>
        <div className="page" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <p className="muted" style={{ margin: 0 }}>
            Smart Campus Operations Hub · React + Spring Boot · OAuth2 + JWT session bridge
          </p>
        </div>
      </footer>

      {/*
        Floating help CTA (right corner) so users can open a ticket quickly.
      */}
      <div className="floating-help-cta" aria-label="Help ticket">
        <div className="floating-help-box">Need any help?</div>
        <Link className="floating-help-btn" to={user ? '/tickets/new' : '/login'}>
          Ticket
        </Link>
      </div>
    </div>
  )
}
