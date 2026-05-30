import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
// import { chatMessages as initialMessages } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'
import ReactMarkdown from 'react-markdown';
import { useLocale } from '../../context/LocaleContext'

const quickChips = [
  { id: 'Headache', labelKey: 'AICHAT_CHIP_HEADACHE' },
  { id: 'Fever', labelKey: 'AICHAT_CHIP_FEVER' },
  { id: 'Dizziness', labelKey: 'AICHAT_CHIP_DIZZINESS' },
  { id: 'Nausea', labelKey: 'AICHAT_CHIP_NAUSEA' },
  { id: 'Swelling', labelKey: 'AICHAT_CHIP_SWELLING' }
]

export default function AIChat() {
  const { t } = useLocale()
  /** For initial messages use this 
  const [messages, setMessages] = useState(
    () => initialMessages.map((m) => ({ ...m }))
  )*/

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = {
      id: `m-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const response = await api.aiChat(text.trim())
      const aiMsg = {
        id: `m-${Date.now()}-ai`,
        role: 'ai',
        text: response.response || response.reply || t('AICHAT_FALLBACK_RESPONSE'),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
      const aiMsg = {
        id: `m-${Date.now()}-ai`,
        role: 'ai',
        text: t('AICHAT_SERVICE_OFFLINE'),
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <MobileLayout
      title={t('AI_SYMPTOM_CHECKER')}
      status="online"
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        <div className="card chat-card">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble ai">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} style={{ margin: '1.5rem 0' }}>
          <div className="input-row">
            <input
              type="text"
              className="input"
              placeholder={t('AICHAT_INPUT_PLACEHOLDER')}
              aria-label={t('AICHAT_INPUT_PLACEHOLDER')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="button" className="icon-btn" title={t('AICHAT_VOICE_INPUT')} aria-label={t('AICHAT_VOICE_INPUT')}>
              
            </button>
            <button type="submit" className="btn btn--primary">
              {t('AICHAT_SEND')}
            </button>
          </div>
        </form>

        <div className="chip-row" style={{ marginTop: '1rem' }}>
          {quickChips.map((chip) => (
            <button
              type="button"
              key={chip.id}
              className="chip"
              onClick={() => sendMessage(t(chip.labelKey))}
            >
              {t(chip.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}
