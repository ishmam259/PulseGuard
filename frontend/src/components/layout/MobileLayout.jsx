import { useState, useEffect } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import $ from '../../config/strings'
import { Sun, Moon, Bell, HeartPulse, LogOut, PhoneCall, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import PulseGuardLogo from '../PulseGuardLogo'

export default function MobileLayout({ title, status, banner, children, navItems, hideSubtitle }) {
  const { connectivity, currentUser, logout, notifications, locale, setLocale, theme, toggleTheme } = useApp()
  const navigate = useNavigate()
  const [activeToast, setActiveToast] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true' } catch { return false }
  })

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }

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
    <div className={`app-layout-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`} style={{ position: 'relative' }}>
      {/* ── Ambient Glow Blobs ── */}
      <div style={{ pointerEvents: 'none', position: 'absolute', top: '-150px', right: '-150px', height: '600px', width: '600px', borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--color-primary) 12%, transparent) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ pointerEvents: 'none', position: 'absolute', top: '50%', left: '-150px', height: '500px', width: '500px', borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--color-bg-accent) 20%, transparent) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

      {/* ── Desktop Sidebar ── */}
      {navItems && navItems.length > 0 && (
        <aside className={`desktop-sidebar${sidebarCollapsed ? ' desktop-sidebar--collapsed' : ''}`}>
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', padding: '0 8px', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!sidebarCollapsed && <PulseGuardLogo size={36} />}
              {!sidebarCollapsed && <span className="logo-text" style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-sans)', color: 'var(--color-text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>PulseGuard</span>}
            </div>
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="desktop-sidebar-nav" style={{ marginTop: '8px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                style={sidebarCollapsed ? { justifyContent: 'center' } : undefined}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.Icon && <item.Icon style={{ height: '16px', width: '16px', flexShrink: 0 }} />}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="desktop-sidebar-logout-btn mobile-layout-logout-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
              title={sidebarCollapsed ? $('LAYOUT_LOGOUT_BTN', locale) : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span>{$('LAYOUT_LOGOUT_BTN', locale)}</span>}
            </button>
          </nav>
        </aside>
      )}

      {/* ── Main Container ── */}
      <div className="main-container">
        {/* ── Mobile Header ── */}
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {navItems && navItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '2px'
                }}
              >
                <Menu className="h-5 w-5" style={{ width: '20px', height: '20px' }} />
              </button>
            )}
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PulseGuardLogo size={28} />
            </div>
          </div>
          <div className="top-center">{title}</div>
          <div className="top-actions">
            <button 
              type="button" 
              onClick={handleAlertsClick} 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '28px',
                width: '28px',
                borderRadius: '50%',
                border: '1px solid var(--color-border)',
                backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                backdropFilter: 'blur(8px)',
                padding: '0'
              }}
              title={$('LAYOUT_ALERTS_BTN', locale)}
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="avatar-container">
              <div className="avatar">{initials}</div>
              <span className={`avatar-status-badge avatar-status-badge--${currentStatus}`} title={currentStatus} />
            </div>
          </div>
        </header>

        {/* ── Desktop Header ── */}
        <header className="desktop-header">
          <div style={{ minWidth: 0 }}>
            <h1 className="font-display" style={{ fontSize: '1.875rem', letterSpacing: '-0.02em', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>{title}</h1>
            {!hideSubtitle && (
              <p style={{ marginTop: '4px', fontSize: '17px', color: 'var(--color-muted)' }}>PulseGuard AI · {currentUser?.role === 'worker' ? $('LAYOUT_PORTAL_WORKER', locale) : $('LAYOUT_PORTAL_PATIENT', locale)}</p>
            )}
          </div>
          <div className="top-actions" style={{ gap: '12px' }}>
            <button 
              type="button" 
              onClick={handleAlertsClick} 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                padding: '6px 14px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
            >
              <Bell className="h-4 w-4" />
              <span>{$('LAYOUT_ALERTS_BTN', locale)}</span>
            </button>
            <button
              type="button"
              onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
              style={{
                borderRadius: '9999px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                padding: '6px 14px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
            >
              {locale === 'en' ? 'বাংলা' : 'English'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'grid',
                placeItems: 'center',
                height: '34px',
                width: '34px',
                borderRadius: '50%',
                border: '1px solid var(--color-border)',
                backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                cursor: 'pointer',
                color: 'var(--color-text)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* ── Real-time SOS Toast Banner ── */}
        {activeToast && (
          <div
            className="emergency-toast mobile-layout-emergency-toast"
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff', animation: 'pulse 1s infinite' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
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
          <section className={`status-banner status-banner--${banner.tone} layout-status-banner`}>
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

        {/* ── Mobile Sidebar Drawer ── */}
        {navItems && navItems.length > 0 && (
          <>
            {/* Backdrop overlay */}
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 9998,
                opacity: isMobileMenuOpen ? 1 : 0,
                pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
                transition: 'opacity 0.25s ease'
              }}
            />
            
            {/* Drawer panel */}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                backgroundColor: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                boxShadow: '24px 0 48px rgba(0, 0, 0, 0.15)',
                zIndex: 9999,
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 20px',
                boxSizing: 'border-box'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PulseGuardLogo size={32} />
                  <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '-0.02em', fontFamily: 'var(--font-sans)' }}>PulseGuard</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* User Profiling info block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', backgroundColor: 'var(--color-surface-hover)', marginBottom: '1.5rem' }}>
                <div style={{ height: '40px', width: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', fontWeight: '700', fontSize: '15px' }}>
                  {initials}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser?.name}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                    {currentUser?.role === 'patient' ? $('LAYOUT_PORTAL_PATIENT', locale) : $('LAYOUT_PORTAL_WORKER', locale)}
                  </p>
                </div>
              </div>

              {/* Theme & Language toggles inside drawer */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
                  style={{
                    flex: 1,
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-hover)',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {locale === 'en' ? 'বাংলা' : 'English'}
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    flex: 1,
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-hover)',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span>{theme === 'dark' ? (locale === 'bn' ? 'লাইট মোড' : 'Light') : (locale === 'bn' ? 'ডার্ক মোড' : 'Dark')}</span>
                </button>
              </div>

              {/* Sidebar Links */}
              <nav className="mobile-drawer-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', margin: '0 -8px', padding: '0 8px' }}>
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `desktop-sidebar-nav-link-mobile ${isActive ? 'active' : ''}`}
                  >
                    {item.Icon && <item.Icon style={{ height: '18px', width: '18px', flexShrink: 0 }} />}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Logout button at the bottom */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-danger)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '1.5rem',
                  width: '100%',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              >
                <LogOut style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{$('LAYOUT_LOGOUT_BTN', locale)}</span>
              </button>
            </div>
          </>
        )}
        {currentUser?.role === 'patient' && (
          <Link
            to="/patient/emergency"
            aria-label="Emergency SOS"
            className="sos-floating-btn"
          >
            <span className="sos-floating-btn-ping" />
            <span className="sos-floating-btn-ring" />
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1' }}>
              <PhoneCall className="h-5 w-5" />
              <span style={{ marginTop: '2px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.18em' }}>SOS</span>
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
