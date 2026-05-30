import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import $ from '../../config/strings'

const sidebarLinks = [
  { label: 'Dashboard', to: '/admin', icon: '' },
  { label: 'Users', to: '/admin/users', icon: '' },
  { label: 'Patients', to: '/admin/patients', icon: '' },
  { label: 'Analytics', to: '/admin/analytics', icon: '' },
  { label: 'Reports', to: '/admin/reports', icon: '' },
  { label: 'Settings', to: '/admin/settings', icon: '' },
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
          {sidebarLinks.map((link) => (
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
            <span>Logout</span>
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
            <h1 className="page-title">{title || 'Dashboard'}</h1>
            <p className="muted">PulseGuard AI, Admin Console</p>
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
            <button type="button" className="icon-btn" style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}>Alerts</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  )
}
