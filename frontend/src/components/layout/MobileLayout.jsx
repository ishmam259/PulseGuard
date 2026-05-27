import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function MobileLayout({ title, status, banner, children, navItems }) {
  const { connectivity, toggleConnectivity, currentUser, logout, notifications } = useApp()
  const navigate = useNavigate()
  const [activeToast, setActiveToast] = useState(null)

  useEffect(() => {
    // Show active SOS alert toast only for workers and admins
    if (currentUser?.role === 'worker' || currentUser?.role === 'admin') {
      const unreadSOS = notifications.find((n) => n.type === 'emergency' && !n.read)
      if (unreadSOS) {
        setActiveToast(unreadSOS)
      }
    }
  }, [notifications, currentUser])

  const initials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

  const currentStatus = status || connectivity

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAlertsClick = () => {
    if (currentUser?.role === 'worker' || currentUser?.role === 'admin') {
      navigate('/worker/alerts')
    } else {
      navigate('/patient/alerts')
    }
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
            <button className="icon-btn" onClick={handleAlertsClick} style={{ fontSize: '11px', width: 'auto', padding: '0 8px' }}>Alerts</button>
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
            <button className="icon-btn" onClick={handleAlertsClick} style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}>Alerts</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        {/* ── Real-time SOS Toast Banner ── */}
        {activeToast && (
          <div
            className="emergency-toast"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
              padding: '1rem',
              borderRadius: '8px',
              margin: '0 1.5rem 1.5rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #fca5a5',
              zIndex: 1000,
              position: 'relative',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', animation: 'pulse 1s infinite' }}>🚨</span>
                <strong style={{ color: '#fff', fontSize: '1rem' }}>{activeToast.title}</strong>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#fee2e2' }}>
                {activeToast.message}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
              <button
                className="btn btn--primary"
                style={{
                  background: '#fff',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setActiveToast(null)
                  // Mark read
                  activeToast.read = true
                  navigate('/worker/alerts')
                }}
              >
                Respond
              </button>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '0 4px'
                }}
                onClick={() => {
                  setActiveToast(null)
                  activeToast.read = true
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

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

