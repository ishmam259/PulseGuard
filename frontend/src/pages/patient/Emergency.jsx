import { useState } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import * as api from '../../services/api'
import $ from '../../config/strings'

export default function Emergency() {
  const { connectivity, locale } = useApp()
  const [gps, setGps] = useState(null)
  const [loadingGps, setLoadingGps] = useState(false)
  const [alertSent, setAlertSent] = useState(false)

  const statusText = connectivity === 'online'
    ? alertSent
      ? $('EMERGENCY_STATUS_SENT', locale)
      : gps
        ? `${$('EMERGENCY_STATUS_GPS', locale)} ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`
        : $('EMERGENCY_STATUS_READY', locale)
    : $('EMERGENCY_STATUS_OFFLINE', locale)

  const handleShareGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
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
        alert('Unable to retrieve location. Please make sure location access is enabled.')
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
        message: 'SOS Emergency Alert triggered from Patient Portal.',
      }

      const result = await api.createAlert(alertData)
      if (result.ok) {
        setAlertSent(true)
      } else {
        alert('Failed to send SOS: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('SOS dispatch error:', err)
      alert('Failed to send SOS alert. Please try again.')
    }
  }


  return (
    <MobileLayout
      title={$('PAGE_TITLE_EMERGENCY', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        <div className="card emergency-card">
          <h2>{$('EMERGENCY_HEADING', locale)}</h2>
          <p className="muted" style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>
            {statusText}
          </p>
          <p className="muted" style={{ margin: '1rem 0' }}>
            {$('EMERGENCY_BODY', locale)}
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
            {alertSent ? $('EMERGENCY_SOS_SENT', locale) : $('EMERGENCY_SOS_BTN', locale)}
          </button>

          <div className="button-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn--secondary btn--large" onClick={handleShareGps} disabled={loadingGps}>
              {loadingGps ? $('EMERGENCY_BTN_GPS_LOADING', locale) : $('EMERGENCY_BTN_GPS', locale)}
            </button>
            <button type="button" className="btn btn--secondary btn--large" onClick={handleSOS}>
              {$('EMERGENCY_BTN_NOTIFY', locale)}
            </button>
            <a href="tel:999" className="btn btn--primary btn--large text-center" style={{ textDecoration: 'none' }}>
              {$('EMERGENCY_BTN_CALL', locale)}
            </a>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
