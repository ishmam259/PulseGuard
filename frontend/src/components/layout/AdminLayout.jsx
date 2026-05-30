import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useLocale } from '../../context/LocaleContext'
import LanguageToggle from '../LanguageToggle'

const sidebarLinks = [
  { key: 'SIDEBAR_DASHBOARD', to: '/admin', icon: '' },
  { key: 'SIDEBAR_USERS', to: '/admin/users', icon: '' },
  { key: 'SIDEBAR_PATIENTS', to: '/admin/patients', icon: '' },
  { key: 'SIDEBAR_ANALYTICS', to: '/admin/analytics', icon: '' },
  { key: 'SIDEBAR_REPORTS', to: '/admin/reports', icon: '' },
  { key: 'SIDEBAR_SETTINGS', to: '/admin/settings', icon: '' },
]

export default function AdminLayout({ title, children }) {
  const { connectivity, currentUser, logout } = useApp()
  const { t } = useLocale()
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
          <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>{t('BRAND_NAME')}</span>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span>{t(link.key)}</span>
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
            <span>{t('LOGOUT')}</span>
          </button>
        </nav>

        {/* ── Sidebar Info Card ── */}
        <div className="info-card">
          <div style={{ marginBottom: '8px' }}>
            <LanguageToggle />
          </div>
          <p className="muted" style={{ fontSize: '0.75rem' }}>
            {t('ADMIN_SIDEBAR_VERSION')}
          </p>
          <p className="muted" style={{ fontSize: '0.75rem' }}>
            {t('ADMIN_SIDEBAR_TAGLINE')}
          </p>
        </div>
      </aside>

      {/* ── Admin Content ── */}
      <div className="admin-content">
        <header className="admin-header">
          <div>
            <h1 className="page-title">{title || t('ADMIN_DASHBOARD_TITLE')}</h1>
            <p className="muted">{t('ADMIN_SUBTITLE')}</p>
          </div>
          <div className="top-actions">
            <span className={`badge badge--${connectivity}`}>
              {connectivity === 'online' && t('ONLINE')}
              {connectivity === 'offline' && t('OFFLINE')}
              {connectivity === 'syncing' && t('SYNCING')}
            </span>
            <button type="button" className="icon-btn" style={{ fontSize: '12px', width: 'auto', padding: '0 12px' }}>{t('ALERTS')}</button>
            <div className="avatar">{initials}</div>
          </div>
        </header>

        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  )
}
