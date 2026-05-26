import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const sidebarLinks = [
  { label: 'Dashboard', to: '/admin', icon: '' },
  { label: 'Patients', to: '/admin/patients', icon: '' },
  { label: 'Analytics', to: '/admin/analytics', icon: '' },
  { label: 'Reports', to: '/admin/reports', icon: '' },
  { label: 'Settings', to: '/admin/settings', icon: '' },
]

export default function AdminLayout({ title, children }) {
  const { connectivity, currentUser } = useApp()
  const initials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'

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
        </nav>

        {/* ── Sidebar Info Card ── */}
        <div className="info-card">
          <p className="muted" style={{ fontSize: '0.75rem' }}>
            PulseGuard AI v1.0.0
          </p>
          <p className="muted" style={{ fontSize: '0.7rem' }}>
            Offline-First Maternal Healthcare
          </p>
        </div>
      </aside>

      {/* ── Admin Content ── */}
      <div className="admin-content">
        <header className="admin-header">
          <div>
            <h1 className="page-title">{title || 'Dashboard'}</h1>
            <p className="muted">PulseGuard AI — Admin Console</p>
          </div>
          <div className="top-actions">
            <span className={`badge badge--${connectivity}`}>
              {connectivity === 'online' && 'Online'}
              {connectivity === 'offline' && 'Offline'}
              {connectivity === 'syncing' && 'Syncing'}
            </span>
            <button className="icon-btn" style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}>Alerts</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  )
}
