import { useState, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

export default function Records() {
  const { locale, connectivity } = useApp()
  const [patient, setPatient] = useState(undefined)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await api.getMyPatientProfile()
        if (data && data.patient) {
          setPatient(data.patient)
          const records = await api.getHistory(data.patient.id)
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
      title={$('PAGE_TITLE_RECORDS', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        <div className="card">
          <div className="card-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="text-gradient">{$('RECORDS_HEADING', locale)}</h3>
            {patient && history.length > 0 && (
              <button type="button" className="btn btn--secondary btn--small" onClick={handleExport}>
                {$('RECORDS_EXPORT_BTN', locale)}
              </button>
            )}
          </div>

          {loading ? (
            <p className="muted text-center" style={{ padding: '2rem 0' }}>{$('RECORDS_LOADING', locale)}</p>
          ) : history.length === 0 ? (
            <p className="muted text-center" style={{ padding: '2rem 0' }}>{$('RECORDS_EMPTY', locale)}</p>
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
                      <strong>{$('RECORDS_FIELD_BP', locale)} {rec.bp_systolic}/{rec.bp_diastolic} mmHg</strong>
                    </div>
                    <span className={`badge badge--${(rec.risk_level || 'low').toLowerCase()}`}>
                      {rec.risk_level || 'low'}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    <span>{$('RECORDS_FIELD_WEIGHT', locale)} {rec.weight_kg ? `${rec.weight_kg} kg` : $('RECORDS_NA', locale)}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>{$('RECORDS_FIELD_TEMP', locale)} {rec.temperature_c ? `${rec.temperature_c} °C` : $('RECORDS_NA', locale)}</span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span>{$('RECORDS_FIELD_PULSE', locale)} {rec.pulse ? `${rec.pulse} bpm` : $('RECORDS_NA', locale)}</span>
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
                    {new Date(rec.recorded_at).toLocaleString()}
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
