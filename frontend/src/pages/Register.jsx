import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const roleLabels = {
  patient: 'Patient / Mother',
  worker: 'Health Worker',
  admin: 'Administrator',
}

const dashboardRoutes = {
  patient: '/patient/dashboard',
  worker: '/worker/dashboard',
  admin: '/admin',
}

export default function Register() {
  const { role } = useParams()
  const navigate = useNavigate()
  const { register } = useApp()
  const roleLabel = roleLabels[role] || 'User'

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields')
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

    setSubmitting(true)
    try {
      const result = await register({ ...form, name: trimmedName, role })
      if (result.ok) {
        const dashRoute = dashboardRoutes[role] || '/patient/dashboard'
        navigate(dashRoute, { replace: true })
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch {
      setError('Connection failed. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="onboarding-container animate-fade-in">
      <div className="onboarding-form-pane">
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <img src="/assets/icons/logo-icon.svg" alt="logo" style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>PulseGuard</span>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Join PulseGuard AI
          </h2>
          <p className="muted">Create your <strong>{roleLabel}</strong> account to get started</p>
        </div>

        {error && (
          <div className="badge badge--offline" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-md)' }}>
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-grid">
            <label>
              Full Name *
              <div className="input-wrapper">
                <img src="/assets/icons/user.svg" alt="user" className="input-icon" />
                <input
                  type="text"
                  className="input"
                  placeholder="Dr. Sarah Connor or Mother's Name"
                  value={form.name}
                  onChange={handleChange('name')}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              Email Address *
              <div className="input-wrapper">
                <img src="/assets/icons/email.svg" alt="email" className="input-icon" />
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
            <label>
              Phone Number
              <div className="input-wrapper">
                <img src="/assets/icons/user.svg" alt="phone" className="input-icon" style={{ filter: 'opacity(0.5)' }} />
                <input
                  type="tel"
                  className="input"
                  placeholder="+880 XXX XXX XXX"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  disabled={submitting}
                />
              </div>
            </label>
            <label>
              Password *
              <div className="input-wrapper">
                <input
                  type="password"
                  className="input"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange('password')}
                  disabled={submitting}
                  required
                />
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--large"
            disabled={submitting}
            style={{ marginTop: '1.5rem' }}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontSize: '13px', width: '100%' }}>
          <span className="muted">Already have an account?</span>
          <Link to={`/login/${role}`} className="link">
            Sign In
          </Link>
        </div>
      </div>

      <div className="onboarding-image-pane">
        <img src="/assets/images/register-img.png" alt="Healthcare Illustration" />
      </div>
    </div>
  )
}
