import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import $ from '../../config/strings'

const sidebarLinks = (locale) => [
  { label: $('ADMIN_NAV_DASHBOARD', locale), to: '/admin', icon: '' },
  { label: $('ADMIN_NAV_USERS', locale), to: '/admin/users', icon: '' },
  { label: $('ADMIN_NAV_PATIENTS', locale), to: '/admin/patients', icon: '' },
  { label: $('ADMIN_NAV_ANALYTICS', locale), to: '/admin/analytics', icon: '' },
  { label: $('ADMIN_NAV_REPORTS', locale), to: '/admin/reports', icon: '' },
  { label: $('ADMIN_NAV_SETTINGS', locale), to: '/admin/settings', icon: '' },
]

export default function AdminLayout({ title, children }) {
  const { connectivity, currentUser, logout, locale, setLocale } = useApp()
  const navigate = useNavigate()
  const initials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
          <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>PulseGuard</span>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks(locale).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span>{link.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout-btn admin-sidebar"
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            onFocus={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
            onBlur={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>{$('LAYOUT_LOGOUT_BTN', locale)}</span>
          </button>
        </nav>

        {/* ── Sidebar Info Card ── */}
        <div className="info-card">
          <p className="muted" style={{ fontSize: '0.75rem' }}>
            PulseGuard AI v1.0.0
          </p>
          <p className="muted" style={{ fontSize: '0.75rem' }}>
            Offline-First Maternal Healthcare
          </p>
        </div>
      </aside>

      {/* ── Admin Content ── */}
      <div className="admin-content">
        <header className="admin-header">
          <div>
            <h1 className="page-title">{title || $('ADMIN_TITLE_DASHBOARD', locale)}</h1>
            <p className="muted">PulseGuard AI, {$('LAYOUT_ADMIN_CONSOLE', locale)}</p>
          </div>
          <div className="top-actions">
            <span className={`badge badge--${connectivity}`}>
              {connectivity === 'online' && $('LAYOUT_ONLINE', locale)}
              {connectivity === 'offline' && $('LAYOUT_OFFLINE', locale)}
              {connectivity === 'syncing' && $('LAYOUT_SYNCING', locale)}
            </span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
              style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}
            >
              {$('LANG_TOGGLE', locale)}
            </button>
            <button type="button" className="icon-btn" style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}>{$('LAYOUT_ALERTS_BTN', locale)}</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  )
}
