import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLocale } from '../context/LocaleContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useApp()
  const { t } = useLocale()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#94a3b8' }}>
        <div className="animate-fade-in">
          <p style={{ fontSize: '1.2rem' }}>{t('LOADING')}</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const dashRoutes = { patient: '/patient/dashboard', worker: '/worker/dashboard', admin: '/admin' }
    return <Navigate to={dashRoutes[currentUser.role] || '/'} replace />
  }

  return children
}
