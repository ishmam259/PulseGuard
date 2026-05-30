import { useState, useEffect } from 'react'
import { useLocale } from '../../context/LocaleContext'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'

export default function Users() {
  const { t, n } = useLocale()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  // Create user form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'worker', // default
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await api.getUsers()
      setUsers(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!form.name || !form.password) {
      setError(t('USERS_NAME_PASS_REQUIRED'))
      return
    }
    if (!form.email && !form.phone) {
      setError(t('USERS_EMAIL_PHONE_REQUIRED'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        role: form.role,
      }
      const res = await api.createUser(payload)
      
      if (res.ok) {
        setShowModal(false)
        setForm({ name: '', email: '', phone: '', password: '', role: 'worker' })
        loadUsers() // Refresh list
      } else {
        setError(res.error || t('USERS_CREATE_FAILED'))
      }
    } catch {
      setError(t('ERROR_CONNECTION_FAILED'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(t('USERS_CONFIRM_DELETE', { name }))) return
    
    try {
      const res = await api.deleteUser(id)
      if (res.ok) {
        loadUsers()
      } else {
        alert(res.error || t('USERS_DELETE_FAILED'))
      }
    } catch {
      alert(t('ERROR_CONNECTION_FAILED'))
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.phone && u.phone.includes(search)) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <AdminLayout title={t('USERS_TITLE')}>
      {/* Header Actions */}
      <div className="card-row animate-fade-in" style={{ marginTop: 0, marginBottom: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          className="input"
          placeholder={t('USERS_SEARCH')}
          aria-label="Search users by name, email, phone, or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        <button className="btn btn--primary" type="button" onClick={() => setShowModal(true)}>
          {t('USERS_ADD')}
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="card text-center animate-pulse" style={{ padding: '2rem' }}>
          <p className="muted">{t('USERS_LOADING')}</p>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <table className="table">
            <thead>
              <tr>
                <th>{t('TABLE_USER_ID')}</th>
                <th>{t('TABLE_NAME')}</th>
                <th>{t('TABLE_ROLE')}</th>
                <th>{t('TABLE_EMAIL')}</th>
                <th>{t('TABLE_PHONE')}</th>
                <th>{t('TABLE_CREATED_AT')}</th>
                <th>{t('TABLE_ACTIONS')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                    {t('USERS_EMPTY')}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-muted)' }}>
                      PG-{n(user.id.slice(0, 8).toUpperCase())}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{ background: user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-surface-3)' }}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge`} style={{ 
                        background: user.role === 'admin' ? 'rgba(99,102,241,0.1)' : (user.role === 'worker' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'),
                        color: user.role === 'admin' ? '#6366f1' : (user.role === 'worker' ? '#10b981' : '#f59e0b')
                      }}>
                        {t('ROLE_' + user.role.toUpperCase())}
                      </span>
                    </td>
                    <td>{user.email || <span className="muted">{t('FALLBACK_NA')}</span>}</td>
                    <td>{user.phone || <span className="muted">{t('FALLBACK_NA')}</span>}</td>
                    <td style={{ color: 'var(--color-muted)' }}>
                      {n(new Date(user.created_at).toLocaleDateString())}
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn--secondary"
                          type="button"
                          style={{ padding: '4px 10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          {t('DELETE')}
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
          <p className="muted">{t('USERS_SHOWING', { filtered: filtered.length, total: users.length })}</p>
          <div className="chip-row">
            <span className="chip" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              {t('USERS_CHIP_WORKERS', { count: users.filter((u) => u.role === 'worker').length })}
            </span>
            <span className="chip" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
              {t('USERS_CHIP_ADMINS', { count: users.filter((u) => u.role === 'admin').length })}
            </span>
            <span className="chip" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
              {t('USERS_CHIP_PATIENTS', { count: users.filter((u) => u.role === 'patient').length })}
            </span>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3>{t('USERS_CREATE_TITLE')}</h3>
            {error && (
              <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', margin: '1rem 0' }}>
                <strong style={{ color: '#ef4444' }}>{error}</strong>
              </div>
            )}
            <form onSubmit={handleCreateUser} style={{ marginTop: '1rem' }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <label>
                  {t('USERS_LABEL_NAME')}
                  <input className="input" placeholder={t('USERS_PLACEHOLDER_NAME')} value={form.name} onChange={handleInputChange('name')} required />
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label>
                    {t('USERS_LABEL_EMAIL')}
                    <input className="input" type="email" placeholder={t('USERS_PLACEHOLDER_EMAIL')} value={form.email} onChange={handleInputChange('email')} />
                  </label>
                  <label>
                    {t('LABEL_PHONE')}
                    <input className="input" type="tel" placeholder={t('USERS_PLACEHOLDER_PHONE')} value={form.phone} onChange={handleInputChange('phone')} />
                  </label>
                </div>
                
                <label>
                  {t('USERS_LABEL_PASSWORD')}
                  <input className="input" type="password" placeholder={t('USERS_PLACEHOLDER_PASSWORD')} value={form.password} onChange={handleInputChange('password')} required minLength={6} />
                </label>
                
                <label>
                  {t('USERS_LABEL_ROLE')}
                  <select className="input" value={form.role} onChange={handleInputChange('role')} required>
                    <option value="worker">{t('USERS_OPTION_WORKER')}</option>
                    <option value="admin">{t('USERS_OPTION_ADMIN')}</option>
                  </select>
                </label>
              </div>
              
              <div className="button-row" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button className="btn btn--secondary" type="button" onClick={() => setShowModal(false)}>
                  {t('CANCEL')}
                </button>
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? t('USERS_CREATING') : t('USERS_CREATE')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
