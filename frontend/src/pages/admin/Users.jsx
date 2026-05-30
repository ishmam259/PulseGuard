import { useState, useEffect } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import * as api from '../../services/api'

export default function Users() {
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
      setError('Name and password are required')
      return
    }
    if (!form.email && !form.phone) {
      setError('Either email or phone is required')
      return
    }

    const trimmedName = form.name.trim()
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setError('Name must contain only letters and spaces')
      return
    }

    if (form.phone && form.phone.trim() !== '') {
      const phoneDigits = form.phone.trim()
      if (!/^\d{11}$/.test(phoneDigits)) {
        setError('Phone number must be exactly 11 digits')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        name: trimmedName,
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
        setError(res.error || 'Failed to create user')
      }
    } catch {
      setError('Connection failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return
    
    try {
      const res = await api.deleteUser(id)
      if (res.ok) {
        loadUsers()
      } else {
        alert(res.error || 'Failed to delete user')
      }
    } catch {
      alert('Connection failed')
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
    <AdminLayout title="User Management">
      {/* Header Actions */}
      <div className="card-row animate-fade-in" style={{ marginTop: 0, marginBottom: 'var(--spacing-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Search users by name, email, phone, or role..."
          aria-label="Search users by name, email, phone, or role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
        <button className="btn btn--primary" type="button" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="card text-center animate-pulse" style={{ padding: '2rem' }}>
          <p className="muted">Loading users list…</p>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-muted)', padding: '2rem' }}>
                    No users found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-muted)' }}>
                      PG-{user.id.slice(0, 8).toUpperCase()}
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
                        {user.role}
                      </span>
                    </td>
                    <td>{user.email || <span className="muted">N/A</span>}</td>
                    <td>{user.phone || <span className="muted">N/A</span>}</td>
                    <td style={{ color: 'var(--color-muted)' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn--secondary"
                          type="button"
                          style={{ padding: '4px 10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          Delete
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
          <p className="muted">Showing {filtered.length} of {users.length} users</p>
          <div className="chip-row">
            <span className="chip" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              Workers: {users.filter((u) => u.role === 'worker').length}
            </span>
            <span className="chip" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
              Admins: {users.filter((u) => u.role === 'admin').length}
            </span>
            <span className="chip" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
              Patients: {users.filter((u) => u.role === 'patient').length}
            </span>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3>Create User Account</h3>
            {error && (
              <div className="alert-panel" style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', margin: '1rem 0' }}>
                <strong style={{ color: '#ef4444' }}>{error}</strong>
              </div>
            )}
            <form onSubmit={handleCreateUser} style={{ marginTop: '1rem' }}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <label>
                  Full Name *
                  <input className="input" placeholder="e.g. Dr. Sarah Rahman" value={form.name} onChange={handleInputChange('name')} required />
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label>
                    Email
                    <input className="input" type="email" placeholder="sarah@pulseguard.com" value={form.email} onChange={handleInputChange('email')} />
                  </label>
                  <label>
                    Phone
                    <input className="input" type="tel" placeholder="+8801700000000" value={form.phone} onChange={handleInputChange('phone')} />
                  </label>
                </div>
                
                <label>
                  Password *
                  <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleInputChange('password')} required minLength={6} />
                </label>
                
                <label>
                  Role *
                  <select className="input" value={form.role} onChange={handleInputChange('role')} required>
                    <option value="worker">Health Worker</option>
                    <option value="admin">Administrator</option>
                  </select>
                </label>
              </div>
              
              <div className="button-row" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button className="btn btn--secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn--primary" type="submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
