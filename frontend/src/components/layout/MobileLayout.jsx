import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function MobileLayout({ title, status, banner, children, navItems }) {
  const { connectivity, toggleConnectivity, currentUser } = useApp()
  const initials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'

  const currentStatus = status || connectivity

  return (
    <div className="mobile-shell">
      {/* ── Top Navigation ── */}
      <header className="top-nav">
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

      {/* ── Optional Status Banner ── */}
      {banner && (
        <section className={`status-banner status-banner--${banner.tone}`}>
          <div>
            <strong>{banner.title}</strong>
            <span className="muted"> — {banner.message}</span>
          </div>
          {banner.action && (
            <button className="btn btn--ghost" onClick={banner.action.onClick}>
              {banner.action.label}
            </button>
          )}
        </section>
      )}

      {/* ── Main Content ── */}
      <main className="content animate-fade-in">{children}</main>

      {/* ── Bottom Navigation ── */}
      {navItems && navItems.length > 0 && (
        <nav className="bottom-nav">
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
  )
}
