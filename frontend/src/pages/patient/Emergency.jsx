import { useState, useEffect } from 'react'
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

  // Emergency contacts state
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', relationship: '' })
  const [formErrors, setFormErrors] = useState({})

  const statusText = connectivity === 'online'
    ? alertSent
      ? $('EMERGENCY_STATUS_SENT', locale)
      : gps
        ? `${$('EMERGENCY_STATUS_GPS', locale)} ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`
        : $('EMERGENCY_STATUS_READY', locale)
    : $('EMERGENCY_STATUS_OFFLINE', locale)

  // Load emergency contacts on mount
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    setLoadingContacts(true)
    try {
      const result = await api.getEmergencyContacts()
      setContacts(result)
    } catch (err) {
      console.error('Failed to load emergency contacts:', err)
    }
    setLoadingContacts(false)
  }

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

    let locationName = null
    if (coords) {
      // Try OpenStreetMap Nominatim for highly detailed address (e.g., street name, road number, sector)
      try {
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
        const geoRes = await fetch(geoUrl, {
          headers: {
            'Accept-Language': 'en'
          }
        })
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData && geoData.display_name) {
            locationName = geoData.display_name
          }
        }
      } catch (osmErr) {
        console.warn('Client-side Nominatim geocoding failed, falling back to BigDataCloud:', osmErr)
      }

      // Fallback to BigDataCloud if Nominatim failed
      if (!locationName) {
        try {
          const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
          const geoRes = await fetch(geoUrl)
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            const parts = []
            if (geoData.locality) parts.push(geoData.locality)
            if (geoData.city) parts.push(geoData.city)
            if (geoData.countryName) parts.push(geoData.countryName)
            if (parts.length > 0) {
              locationName = parts.join(', ')
            } else if (geoData.displayName) {
              locationName = geoData.displayName
            }
          }
        } catch (geoErr) {
          console.warn('Client-side BigDataCloud geocoding failed:', geoErr)
        }
      }
    }

    try {
      const alertData = {
        latitude: coords ? coords.lat : null,
        longitude: coords ? coords.lng : null,
        locationName,
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

  // ── Emergency Contact Form Handlers ──

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', relationship: '' })
    setFormErrors({})
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = $('EC_ERR_NAME_REQUIRED', locale)
    if (!formData.email.trim()) errors.email = $('EC_ERR_EMAIL_REQUIRED', locale)
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = $('EC_ERR_EMAIL_INVALID', locale)
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleDeleteContact = async (contact) => {
    if (!window.confirm($('EC_DELETE_CONFIRM', locale))) return
    try {
      const result = await api.deleteEmergencyContact(contact.id)
      if (result.ok) {
        setContacts(prev => prev.filter(c => c.id !== contact.id))
      }
    } catch (err) {
      console.error('Delete contact error:', err)
    }
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    if (contacts.length >= 5) {
      alert($('EC_MAX_REACHED', locale))
      return
    }

    setSaving(true)
    try {
      const result = await api.createEmergencyContact(formData)
      if (result.ok) {
        setContacts(prev => [...prev, result.contact])
        resetForm()
      } else {
        alert(result.error || 'Failed to add contact')
      }
    } catch (err) {
      console.error('Save contact error:', err)
    }
    setSaving(false)
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
            <a href="tel:999" className="btn btn--danger btn--large text-center" style={{ textDecoration: 'none' }}>
              {$('EMERGENCY_BTN_CALL', locale)}
            </a>
          </div>
        </div>

        {/* ── Add Emergency Contact Form (always visible) ── */}
        <div className="ec-add-card" style={{ marginTop: '1.5rem' }}>
          <div className="ec-add-card-inner">
            <h3 className="ec-add-title">
              <svg className="ec-add-title-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 8v6M22 11h-6" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {$('EC_SECTION_TITLE', locale)}
            </h3>
            <p className="ec-add-desc">{$('EC_SECTION_DESC', locale)}</p>

            <form className="ec-inline-form" onSubmit={handleAddContact}>
              <div className="ec-form-grid">
                <div className="ec-field">
                  <label htmlFor="ec-name">{$('EC_LABEL_NAME', locale)}</label>
                  <input
                    id="ec-name"
                    className={`ec-input ${formErrors.name ? 'ec-input--error' : ''}`}
                    type="text"
                    placeholder={$('EC_PH_NAME', locale)}
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  {formErrors.name && <span className="ec-error">{formErrors.name}</span>}
                </div>

                <div className="ec-field">
                  <label htmlFor="ec-relationship">{$('EC_LABEL_RELATIONSHIP', locale)}</label>
                  <input
                    id="ec-relationship"
                    className="ec-input"
                    type="text"
                    placeholder={$('EC_PH_RELATIONSHIP', locale)}
                    value={formData.relationship}
                    onChange={e => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  />
                </div>

                <div className="ec-field">
                  <label htmlFor="ec-email">{$('EC_LABEL_EMAIL', locale)}</label>
                  <input
                    id="ec-email"
                    className={`ec-input ${formErrors.email ? 'ec-input--error' : ''}`}
                    type="email"
                    placeholder={$('EC_PH_EMAIL', locale)}
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  {formErrors.email && <span className="ec-error">{formErrors.email}</span>}
                </div>

                <div className="ec-field">
                  <label htmlFor="ec-phone">{$('EC_LABEL_PHONE', locale)}</label>
                  <input
                    id="ec-phone"
                    className="ec-input"
                    type="tel"
                    placeholder={$('EC_PH_PHONE', locale)}
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="ec-submit-btn"
                disabled={saving || contacts.length >= 5}
                id="ec-add-contact-btn"
              >
                {saving ? $('EC_BTN_SAVING', locale) : $('EC_ADD_BTN', locale)}
              </button>
            </form>
          </div>
        </div>

        {/* ── Your Emergency Contacts List ── */}
        <div className="ec-list-section" style={{ marginTop: '1.5rem' }}>
          <h3 className="ec-list-title">
            <svg className="ec-list-title-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {$('EC_LIST_HEADING', locale)}
          </h3>

          {loadingContacts ? (
            <div className="ec-empty-card">
              <p>{$('EC_LOADING', locale)}</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="ec-empty-card">
              <p>{$('EC_EMPTY', locale)}</p>
            </div>
          ) : (
            <div className="ec-contacts-list">
              {contacts.map((contact) => (
                <div key={contact.id} className="ec-contact-card">
                  <div className="ec-contact-body">
                    <div className="ec-contact-name">{contact.name}</div>
                    {contact.relationship && (
                      <div className="ec-contact-relationship">{contact.relationship}</div>
                    )}
                    <div className="ec-contact-meta">
                      <span className="ec-meta-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                        {contact.email}
                      </span>
                      {contact.phone && <span className="ec-meta-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {contact.phone}
                      </span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ec-delete-btn"
                    onClick={() => handleDeleteContact(contact)}
                    title={$('EC_BTN_DELETE', locale)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
