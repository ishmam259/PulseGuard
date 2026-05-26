import AdminLayout from '../../components/layout/AdminLayout'

const settingsCards = [
  {
    id: 'set-1',
    icon: '',
    title: 'User Management',
    description: 'Manage health workers, patients, and admin accounts. Assign roles and configure permissions.',
    buttonText: 'Manage Users',
    buttonClass: 'btn--primary',
  },
  {
    id: 'set-2',
    icon: '',
    title: 'AI Configuration',
    description: 'Set risk prediction thresholds, model selection (XGBoost/Llama 3), and alert sensitivity levels.',
    buttonText: 'Configure AI',
    buttonClass: 'btn--primary',
  },
  {
    id: 'set-3',
    icon: '',
    title: 'Offline & Sync Settings',
    description: 'Configure sync frequency, conflict resolution mode (auto-merge vs manual), and storage limits.',
    buttonText: 'Update Settings',
    buttonClass: 'btn--secondary',
  },
  {
    id: 'set-4',
    icon: '',
    title: 'Language Settings',
    description: 'Configure Bengali and English language support. Set default language for AI responses.',
    buttonText: 'Manage Languages',
    buttonClass: 'btn--secondary',
  },
]

export default function Settings() {
  const handleFeatureAlert = (title) => {
    alert(`Feature Coming Soon!\nThe "${title}" configuration panel is disabled for this hackathon demo version.`)
  }

  return (
    <AdminLayout title="Settings">
      <section className="grid two stagger">
        {settingsCards.map((card, i) => (
          <div className="card animate-fade-in" key={card.id} style={{ animationDelay: `${i * 80}ms` }}>
            <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-3)' }}>{card.icon}</div>
            <h3>{card.title}</h3>
            <p className="muted" style={{ marginBottom: 'var(--spacing-4)' }}>{card.description}</p>
            <button
              className={`btn ${card.buttonClass}`}
              type="button"
              onClick={() => handleFeatureAlert(card.title)}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </section>

      {/* System Info */}
      <section className="card animate-fade-in" style={{ animationDelay: '320ms', marginTop: 'var(--spacing-5)' }}>
        <h3>System Information</h3>
        <div className="summary-grid" style={{ marginTop: 'var(--spacing-4)' }}>
          <div>
            <p className="muted">Version</p>
            <strong>PulseGuard v1.0.0</strong>
          </div>
          <div>
            <p className="muted">Stack</p>
            <strong>PERN + Python AI</strong>
          </div>
          <div>
            <p className="muted">AI Models</p>
            <strong>Llama 3 + XGBoost</strong>
          </div>
          <div>
            <p className="muted">Database</p>
            <strong>PostgreSQL + pgvector</strong>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
