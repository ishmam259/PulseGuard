import AdminLayout from '../../components/layout/AdminLayout'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import $ from '../../config/strings'

export default function Settings() {
  const navigate = useNavigate()
  const { locale } = useApp()
  
  const settingsCards = [
    {
      id: 'set-1',
      icon: '',
      title: $('ADMIN_SET_U_TITLE', locale),
      description: $('ADMIN_SET_U_DESC', locale),
      buttonText: $('ADMIN_SET_U_BTN', locale),
      buttonClass: 'btn--primary',
      path: '/admin/users'
    },
    {
      id: 'set-2',
      icon: '',
      title: $('ADMIN_SET_AI_TITLE', locale),
      description: $('ADMIN_SET_AI_DESC', locale),
      buttonText: $('ADMIN_SET_AI_BTN', locale),
      buttonClass: 'btn--primary',
      path: '/admin/ai-config',
    },
    {
      id: 'set-3',
      icon: '',
      title: $('ADMIN_SET_SYNC_TITLE', locale),
      description: $('ADMIN_SET_SYNC_DESC', locale),
      buttonText: $('ADMIN_SET_SYNC_BTN', locale),
      buttonClass: 'btn--secondary',
    },
  ]

  const handleAction = (card) => {
    if (card.path) {
      navigate(card.path)
    } else {
      alert(`Feature Coming Soon!\nThe "${card.title}" configuration panel is disabled for this hackathon demo version.`)
    }
  }

  return (
    <AdminLayout title={$('ADMIN_TITLE_SETTINGS', locale)}>
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
