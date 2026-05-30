import { useState } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { useLocale } from '../../context/LocaleContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'

export default function Emergency() {
  const { connectivity } = useApp()
  const { t } = useLocale()
  const [gps, setGps] = useState(null)
  const [loadingGps, setLoadingGps] = useState(false)
  const [alertSent, setAlertSent] = useState(false)

  const statusText = connectivity === 'online'
    ? alertSent
      ? t('EMERGENCY_DISPATCHED')
      : gps
        ? t('EMERGENCY_GPS_COORDS', { lat: gps.lat.toFixed(5), lng: gps.lng.toFixed(5) })
        : t('EMERGENCY_SYSTEM_READY')
    : t('EMERGENCY_OFFLINE_ACTIVE')

  const handleShareGps = () => {
    if (!navigator.geolocation) {
      alert(t('EMERGENCY_GEO_NOT_SUPPORTED'))
      return
    }
    setLoadingGps(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setGps({ lat: latitude, lng: longitude })
        setLoadingGps(false)
      },
      (error) => {
        console.error(error)
        alert(t('EMERGENCY_GEO_FAILED'))
        setLoadingGps(false)
      }
    )
  }

  const handleSOS = async () => {
    setLoadingGps(true)
    let coords = gps

    if (!coords && navigator.geolocation) {
      try {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords
              const newGps = { lat: latitude, lng: longitude }
              setGps(newGps)
              resolve(newGps)
            },
            (error) => {
              console.warn('Geolocation failed:', error.message)
              resolve(null)
            },
            { timeout: 4000 }
          )
        })
      } catch (err) {
        console.warn('Geolocation promise error:', err)
      }
    }

    setLoadingGps(false)

    try {
      const alertData = {
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lng : null,
        message: t('EMERGENCY_SOS_MESSAGE'),
      }

      const result = await api.createAlert(alertData)
      if (result.ok) {
        setAlertSent(true)
      } else {
        alert(t('EMERGENCY_SEND_FAILED', { error: result.error || t('EMERGENCY_UNKNOWN_ERROR') }))
      }
    } catch (err) {
      console.error('SOS dispatch error:', err)
      alert(t('EMERGENCY_SEND_FAILED_GENERIC'))
    }
  }


  return (
    <MobileLayout
      title={t('EMERGENCY_PAGE_TITLE')}
      status={connectivity}
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        <div className="card emergency-card">
          <h2>{t('EMERGENCY_ALERT_HEADING')}</h2>
          <p className="muted" style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>
            {statusText}
          </p>
          <p className="muted" style={{ margin: '1rem 0' }}>
            {t('EMERGENCY_INSTRUCTIONS')}
          </p>

          <button
            type="button"
            className={`sos-btn ${alertSent ? '' : 'animate-pulse'}`}
            style={{
              background: alertSent ? '#10b981' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
              boxShadow: alertSent ? '0 0 20px #10b981' : '0 0 20px #ef4444',
            }}
            onClick={handleSOS}
          >
            {alertSent ? t('EMERGENCY_SOS_BTN_SENT') : t('EMERGENCY_SOS_BTN')}
          </button>

          <div className="button-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn--secondary btn--large" onClick={handleShareGps} disabled={loadingGps}>
              {loadingGps ? t('EMERGENCY_FETCHING_LOCATION') : t('EMERGENCY_SHARE_GPS')}
            </button>
            <button type="button" className="btn btn--secondary btn--large" onClick={handleSOS}>
              {t('EMERGENCY_NOTIFY_WORKER')}
            </button>
            <a href="tel:999" className="btn btn--primary btn--large text-center" style={{ textDecoration: 'none' }}>
              {t('EMERGENCY_CALL_SERVICES')}
            </a>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
