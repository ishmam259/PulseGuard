import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function MobileLayout({ title, status, banner, children, navItems }) {
  const { connectivity, toggleConnectivity, currentUser, logout } = useApp()
  const navigate = useNavigate()
  const initials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

  const currentStatus = status || connectivity

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-layout-shell">
      {/* ── Desktop Sidebar ── */}
      {navItems && navItems.length > 0 && (
        <aside className="desktop-sidebar">
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>PulseGuard</span>
          </div>

          <nav className="desktop-sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="desktop-sidebar-logout-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: '#ef4444',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                width: '100%',
                marginTop: 'auto'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>Logout</span>
            </button>
          </nav>
        </aside>
      )}

      {/* ── Main Container ── */}
      <div className="main-container">
        {/* ── Mobile Header ── */}
        <header className="mobile-header">
          <div className="logo">
            <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
          </div>
          <div className="top-center">{title}</div>
          <div className="top-actions">
            <span
              className={`badge badge--${currentStatus}`}
              onClick={toggleConnectivity}
              style={{ cursor: 'pointer' }}
              title="Click to toggle connectivity state"
            >
              {currentStatus === 'online' && 'Online'}
              {currentStatus === 'offline' && 'Offline'}
              {currentStatus === 'syncing' && 'Syncing'}
            </span>
            <button className="icon-btn" style={{ fontSize: '11px', width: 'auto', padding: '0 8px' }}>Alerts</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        {/* ── Desktop Header ── */}
        <header className="desktop-header">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="muted">PulseGuard AI — {currentUser?.role === 'worker' ? 'Maternal Health Worker Portal' : 'Patient Portal'}</p>
          </div>
          <div className="top-actions">
            <span
              className={`badge badge--${currentStatus}`}
              onClick={toggleConnectivity}
              style={{ cursor: 'pointer' }}
              title="Click to toggle connectivity state"
            >
              {currentStatus === 'online' && 'Online'}
              {currentStatus === 'offline' && 'Offline'}
              {currentStatus === 'syncing' && 'Syncing'}
            </span>
            <button className="icon-btn" style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}>Alerts</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        {/* ── Optional Status Banner ── */}
        {banner && (
          <section className={`status-banner status-banner--${banner.tone}`} style={{ marginBottom: '1.5rem' }}>
            <div>
              <strong>{banner.title || 'Status'}</strong>
              <span className="muted"> — {banner.message}</span>
            </div>
            {banner.action && (
              <button className="btn btn--ghost" onClick={banner.action.onClick}>
                {banner.action.label}
              </button>
            )}
          </section>
        )}

        {/* ── Main Content Area ── */}
        <main className="content-area animate-fade-in">{children}</main>

        {/* ── Mobile Bottom Navigation ── */}
        {navItems && navItems.length > 0 && (
          <nav className="mobile-bottom-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}

