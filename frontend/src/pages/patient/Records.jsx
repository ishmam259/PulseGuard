import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import { useLocale } from '../../context/LocaleContext'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'

export default function Records() {
  const { t, n } = useLocale()
  const [patient, setPatient] = useState(undefined)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const patients = await api.getPatients()
        if (patients && patients.length > 0) {
          const mainPatient = patients[0]
          setPatient(mainPatient)
          const records = await api.getHistory(mainPatient.id)
          setHistory(records)
        }
      } catch (err) {
        console.error('Failed to load patient records:', err)
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [])

  const handleExport = () => {
    if (!patient) return
    const token = api.getToken()
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    window.open(`${apiBase}/patients/${patient.id}/export?token=${token}`, '_blank')
  }

  return (
    <MobileLayout
      title={t('RECORDS_PAGE_TITLE')}
      status="online"
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        <div className="card">
          <div className="card-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-gradient">{t('RECORDS_HEADING')}</h3>
            {patient && history.length > 0 && (
              <button type="button" className="btn btn--secondary btn--small" onClick={handleExport}>
                {t('RECORDS_EXPORT')}
              </button>
            )}
          </div>

          {loading ? (
            <p className="muted text-center" style={{ padding: '2rem 0' }}>{t('RECORDS_LOADING')}</p>
          ) : history.length === 0 ? (
            <p className="muted text-center" style={{ padding: '2rem 0' }}>{t('RECORDS_NO_RECORDS')}</p>
          ) : (
            <div className="list" style={{ marginTop: '1rem' }}>
              {history.map((rec, i) => (
                <div
                  key={rec.id}
                  className="list-item stagger"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div>
                      <span style={{ marginRight: '0.5rem' }}></span>
                      <strong>{t('RECORDS_BP_LABEL')}: {n(rec.bp_systolic)}/{n(rec.bp_diastolic)} mmHg</strong>
                    </div>
                    <span className={`badge badge--${(rec.risk_level || 'low').toLowerCase()}`}>
                      {rec.risk_level || 'low'}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    <span>{t('RECORDS_WEIGHT_LABEL')}: {rec.weight_kg ? `${n(rec.weight_kg)} kg` : t('FALLBACK_NA')}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>{t('RECORDS_TEMP_LABEL')}: {rec.temperature_c ? `${n(rec.temperature_c)} °C` : t('FALLBACK_NA')}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>{t('RECORDS_PULSE_LABEL')}: {rec.pulse ? `${n(rec.pulse)} bpm` : t('FALLBACK_NA')}</span>
                  </div>
                  {rec.symptoms && rec.symptoms.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {rec.symptoms.map((symp) => (
                        <span key={symp} className="pill warning" style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}>
                          {symp}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem', width: '100%', textAlign: 'right' }}>
                    {n(new Date(rec.recorded_at).toLocaleString())}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  )
}
