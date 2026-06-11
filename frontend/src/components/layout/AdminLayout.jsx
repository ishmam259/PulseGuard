import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import $ from '../../config/strings'
import { Sun, Moon, Bell, HeartPulse, LogOut, LayoutDashboard, Users, Activity, FileText, Settings, ShoppingBag, Globe, Menu, X } from 'lucide-react'

const sidebarLinks = (locale) => [
  { label: $('ADMIN_NAV_DASHBOARD', locale), to: '/admin', Icon: LayoutDashboard },
  { label: $('ADMIN_NAV_USERS', locale), to: '/admin/users', Icon: Users },
  { label: $('ADMIN_NAV_PATIENTS', locale), to: '/admin/patients', Icon: HeartPulse },
  { label: $('ADMIN_NAV_ANALYTICS', locale), to: '/admin/analytics', Icon: Activity },
  { label: $('ADMIN_NAV_REPORTS', locale), to: '/admin/reports', Icon: FileText },
  { label: $('NAV_P_STORE', locale), to: '/store', Icon: ShoppingBag },
  { label: $('ADMIN_NAV_SETTINGS', locale), to: '/admin/settings', Icon: Settings },
]

export default function AdminLayout({ title, children }) {
  const { connectivity, currentUser, logout, locale, setLocale, theme, toggleTheme } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = currentUser ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'

  // close drawer on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = ({ onLinkClick }) => (
    <>
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <span style={{ display: 'grid', placeItems: 'center', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)', boxShadow: 'var(--shadow-glow-primary)' }}>
          <HeartPulse className="h-5 w-5" strokeWidth={2.5} style={{ color: 'var(--color-surface)' }} />
        </span>
        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text)' }}>PulseGuard</span>
      </div>

      <nav className="sidebar-nav">
        {sidebarLinks(locale).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) => (isActive ? 'active' : '')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            onClick={onLinkClick}
          >
            {link.Icon && <link.Icon className="h-4 w-4" style={{ flexShrink: 0 }} />}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="sidebar-logout-btn admin-sidebar"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', flexShrink: 0 }}
      >
        <LogOut className="h-4 w-4" />
        <span>{$('LAYOUT_LOGOUT_BTN', locale)}</span>
      </button>
    </>
  )

  return (
    <div className="admin-shell" style={{ position: 'relative' }}>
      {/* ── Ambient Glow Blobs ── */}
      <div style={{ pointerEvents: 'none', position: 'absolute', top: '-160px', right: '-160px', height: '500px', width: '500px', borderRadius: '50%', background: 'var(--color-primary)', opacity: 0.08, filter: 'blur(120px)', zIndex: 0 }} />
      <div style={{ pointerEvents: 'none', position: 'absolute', top: '50%', left: '-160px', height: '400px', width: '400px', borderRadius: '50%', background: 'var(--color-bg-accent)', opacity: 0.15, filter: 'blur(100px)', zIndex: 0 }} />

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar" style={{ zIndex: 10 }}>
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* ── Mobile Drawer Backdrop ── */}
      {menuOpen && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside className={`admin-drawer${menuOpen ? ' admin-drawer--open' : ''}`}>
        <button
          type="button"
          className="admin-drawer-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onLinkClick={() => setMenuOpen(false)} />
      </aside>

      {/* ── Admin Content ── */}
      <div className="admin-content">
        <header className="admin-header">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="admin-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="page-title">{title || $('ADMIN_TITLE_DASHBOARD', locale)}</h1>
            <p className="muted">{$('LAYOUT_ADMIN_CONSOLE', locale)}</p>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="admin-locale-btn"
              onClick={() => setLocale(prev => prev === 'en' ? 'bn' : 'en')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '9999px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Globe className="h-4 w-4" style={{ flexShrink: 0 }} />
              <span>{locale === 'en' ? 'বাংলা' : 'English'}</span>
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
                backdropFilter: 'blur(8px)'
              }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => navigate('/worker/alerts')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '9999px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Bell className="h-4 w-4" />
              <span>{$('LAYOUT_ALERTS_BTN', locale)}</span>
            </button>
            <button
              type="button"
              className="avatar-container"
              onClick={() => navigate('/admin/settings')}
              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              title="Admin Settings"
            >
              <div className="avatar">{initials}</div>
              <span className={`avatar-status-badge avatar-status-badge--${connectivity}`} title={connectivity} />
            </button>
          </div>
        </header>

        <div className="admin-children-wrapper animate-fade-in">{children}</div>
      </div>
    </div>
  )
}
