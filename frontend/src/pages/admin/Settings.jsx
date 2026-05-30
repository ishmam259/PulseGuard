import AdminLayout from '../../components/layout/AdminLayout'
import { useNavigate } from 'react-router-dom'

const settingsCards = [
  {
    id: 'set-1',
    icon: '',
    title: 'User Management',
    description: 'Manage health workers, patients, and admin accounts. Assign roles and configure permissions.',
    buttonText: 'Manage Users',
    buttonClass: 'btn--primary',
    path: '/admin/users'
  },
  {
    id: 'set-2',
    icon: '',
    title: 'AI Configuration',
    description: 'Set risk prediction thresholds, model selection (XGBoost/Llama 3), and alert sensitivity levels.',
    buttonText: 'Configure AI',
    buttonClass: 'btn--primary',
    path: '/admin/ai-config',
  },
  {
    id: 'set-3',
    icon: '',
    title: 'Offline & Sync Settings',
    description: 'Configure sync frequency, conflict resolution mode (auto-merge vs manual), and storage limits.',
    buttonText: 'Update Settings',
    buttonClass: 'btn--secondary',
  },
]

export default function Settings() {
  const navigate = useNavigate()
  
  const handleAction = (card) => {
    if (card.path) {
      navigate(card.path)
    } else {
      alert(`Feature Coming Soon!\nThe "${card.title}" configuration panel is disabled for this hackathon demo version.`)
    }
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
              onClick={() => handleAction(card)}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </section>


    </AdminLayout>
  )
}
