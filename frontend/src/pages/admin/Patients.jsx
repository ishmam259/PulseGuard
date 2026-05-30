import { useState, useEffect } from 'react'
import { useLocale } from '../../context/LocaleContext'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'

export default function Patients() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    age: '',
    village: '',
    gestational_week: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients() {
    setLoading(true)
    try {
      const data = await api.getPatients()
      setPatients(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleCreatePatient = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name) {
      setError(t('ADMIN_PATIENTS_NAME_REQUIRED'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        village: form.village || undefined,
        gestational_week: form.gestational_week ? parseInt(form.gestational_week) : undefined,
      }
      const res = await api.createPatient(payload)
      if (res.ok) {
        setShowModal(false)
        setForm({ name: '', age: '', village: '', gestational_week: '' })
        loadPatients()
      } else {
        setError(res.error || t('ADMIN_PATIENTS_CREATE_FAILED'))
      }
    } catch {
      setError(t('ERROR_CONNECTION_FAILED'))
    } finally {
      setSaving(false)
    }
  }

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.village && p.village.toLowerCase().includes(search.toLowerCase())) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <AdminLayout title={t('ADMIN_PATIENTS_TITLE')}>
      {/* Header Actions */}
      <div className="card-row animate-fade-in" style={{ marginTop: 0, marginBottom: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          className="input"
          placeholder={t('ADMIN_PATIENTS_SEARCH')}
          aria-label="Search patients by name, village, or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        <button className="btn btn--primary" type="button" onClick={() => setShowModal(true)}>
          {t('ADMIN_PATIENTS_ADD')}
        </button>
      </div>

      {/* Patients Table */}
      {loading ? (
        <div className="card text-center animate-pulse" style={{ padding: '2rem' }}>
          <p className="muted">{t('ADMIN_PATIENTS_LOADING')}</p>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <table className="table">
            <thead>
              <tr>
                <th>{t('TABLE_PATIENT_ID')}</th>
                <th>{t('TABLE_NAME')}</th>
                <th>{t('TABLE_RISK_LEVEL')}</th>
                <th>{t('TABLE_WEEK')}</th>
                <th>{t('TABLE_ASSIGNED_WORKER')}</th>
                <th>{t('TABLE_LAST_UPDATED')}</th>
                <th>{t('TABLE_ACTIONS')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                    {t('ADMIN_PATIENTS_EMPTY')}
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-muted)' }}>
                      PG-{patient.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar">{getInitials(patient.name)}</div>
                        <div>
                          <strong>{patient.name}</strong>
                          <p className="muted" style={{ fontSize: '12px' }}>{patient.village || t('FALLBACK_NA')}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge--${(patient.risk_level || 'low').toLowerCase()}`}>
                        {patient.risk_level || 'low'}
                      </span>
                    </td>
                    <td>{patient.gestational_week || t('FALLBACK_NA')}</td>
                    <td>{patient.worker_name || t('UNASSIGNED')}</td>
                    <td style={{ color: 'var(--color-muted)' }}>
                      {new Date(patient.last_updated).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn--secondary"
                          type="button"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => navigate(`/worker/patient/${patient.id}`)}
                        >
                          {t('ADMIN_PATIENTS_VIEW_DETAILS')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="card-row" style={{ marginTop: 'var(--spacing-4)' }}>
          <p className="muted">{t('ADMIN_PATIENTS_SHOWING', { filtered: filtered.length, total: patients.length })}</p>
          <div className="chip-row">
            <span className="chip" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {t('CHIP_HIGH_RISK', { count: patients.filter((p) => p.risk_level === 'high').length })}
            </span>
            <span className="chip" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
              {t('CHIP_MODERATE', { count: patients.filter((p) => p.risk_level === 'moderate').length })}
            </span>
            <span className="chip" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>
              {t('CHIP_LOW', { count: patients.filter((p) => p.risk_level === 'low').length })}
            </span>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showModal && (
        <div className="modal-backdrop admin-patient-modal-overlay">
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3>{t('ADMIN_PATIENTS_CREATE_TITLE')}</h3>
            {error && (
              <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', margin: '1rem 0' }}>
                <strong style={{ color: '#ef4444' }}>{error}</strong>
              </div>
            )}
            <form onSubmit={handleCreatePatient} style={{ marginTop: '1rem' }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <label>
                  {t('ADMIN_PATIENTS_LABEL_NAME')}
                  <input className="input" placeholder={t('ADMIN_PATIENTS_PLACEHOLDER_NAME')} value={form.name} onChange={handleInputChange('name')} required />
                </label>
                <label>
                  {t('ADMIN_PATIENTS_LABEL_AGE')}
                  <input className="input" type="number" placeholder="25" value={form.age} onChange={handleInputChange('age')} />
                </label>
                <label>
                  {t('ADMIN_PATIENTS_LABEL_VILLAGE')}
                  <input className="input" placeholder={t('ADMIN_PATIENTS_PLACEHOLDER_VILLAGE')} value={form.village} onChange={handleInputChange('village')} />
                </label>
                <label>
                  {t('ADMIN_PATIENTS_LABEL_GESTATIONAL')}
                  <input className="input" type="number" placeholder="24" value={form.gestational_week} onChange={handleInputChange('gestational_week')} />
                </label>
              </div>
              <div className="button-row" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button className="btn btn--secondary" type="button" onClick={() => setShowModal(false)}>
                  {t('CANCEL')}
                </button>
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? t('ADMIN_PATIENTS_CREATING') : t('ADMIN_PATIENTS_CREATE')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
