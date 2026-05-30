import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import $ from '../../config/strings'

export default function MobileLayout({ title, status, banner, children, navItems }) {
  const { connectivity, toggleConnectivity, currentUser, logout, notifications, locale, setLocale } = useApp()
  const navigate = useNavigate()
  const [activeToast, setActiveToast] = useState(null)

  useEffect(() => {
    // Show active SOS alert toast only for workers and admins
    let timer
    if (currentUser?.role === 'worker' || currentUser?.role === 'admin') {
      const unreadSOS = notifications.find((n) => n.type === 'emergency' && !n.read)
      if (unreadSOS) {
        timer = setTimeout(() => {
          setActiveToast(unreadSOS)
        }, 0)
      }
    }
    return () => {
      if (timer) clearTimeout(timer)
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
              type="button"
              onClick={handleLogout}
              className="desktop-sidebar-logout-btn mobile-layout-logout-btn"
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              onFocus={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              onBlur={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>{$('LAYOUT_LOGOUT_BTN', locale)}</span>
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
            <button
              type="button"
              className={`badge badge--${currentStatus}`}
              onClick={toggleConnectivity}
              style={{ cursor: 'pointer', font: 'inherit', color: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit' }}
              title="Click to toggle connectivity state"
            >
              {currentStatus === 'online' && $('LAYOUT_ONLINE', locale)}
              {currentStatus === 'offline' && $('LAYOUT_OFFLINE', locale)}
              {currentStatus === 'syncing' && $('LAYOUT_SYNCING', locale)}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
              style={{ fontSize: '12px', width: 'auto', padding: '0 8px' }}
            >
              {$('LANG_TOGGLE', locale)}
            </button>
            <button type="button" className="icon-btn" onClick={handleAlertsClick} style={{ fontSize: '12px', width: 'auto', padding: '0 8px' }}>{$('LAYOUT_ALERTS_BTN', locale)}</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        {/* ── Desktop Header ── */}
        <header className="desktop-header">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="muted">PulseGuard AI: {currentUser?.role === 'worker' ? $('LAYOUT_PORTAL_WORKER', locale) : $('LAYOUT_PORTAL_PATIENT', locale)}</p>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className={`badge badge--${currentStatus}`}
              onClick={toggleConnectivity}
              style={{ cursor: 'pointer', font: 'inherit', color: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit' }}
              title="Click to toggle connectivity state"
            >
              {currentStatus === 'online' && $('LAYOUT_ONLINE', locale)}
              {currentStatus === 'offline' && $('LAYOUT_OFFLINE', locale)}
              {currentStatus === 'syncing' && $('LAYOUT_SYNCING', locale)}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
              style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}
            >
              {$('LANG_TOGGLE', locale)}
            </button>
            <button type="button" className="icon-btn" onClick={handleAlertsClick} style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}>{$('LAYOUT_ALERTS_BTN', locale)}</button>
            <NavLink to={navItems.find(item => item.to.includes('profile'))?.to || '#'}>
              <div className="avatar">{initials}</div>
            </NavLink> 
          </div>
        </header>

        {/* ── Real-time SOS Toast Banner ── */}
        {activeToast && (
          <div
            className="emergency-toast mobile-layout-emergency-toast"
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
                type="button"
                className="btn btn--primary mobile-layout-respond-btn"
                onClick={() => {
                  setActiveToast(null)
                  // Mark read
                  navigate('/worker/alerts')
                }}
              >
                {$('LAYOUT_RESPOND_BTN', locale)}
              </button>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '0 4px'
                }}
                onClick={() => {
                  setActiveToast((prev) => prev ? { ...prev, read: true } : null)
                  setActiveToast(null)
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
              <span className="muted"> &ndash; {banner.message}</span>
            </div>
            {banner.action && (
              <button type="button" className="btn btn--ghost" onClick={banner.action.onClick}>
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

