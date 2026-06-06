import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import ReactMarkdown from 'react-markdown'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import { Send, Sparkles, AlertTriangle } from 'lucide-react'

const quickChips = ['Headache', 'Fever', 'Dizziness', 'Nausea', 'Swelling']

const SOURCE_BADGE = {
  offline: { label: 'Offline Answer', style: { background: 'oklch(0.72 0.16 50)', color: '#fff' } },
  gemini:  { label: 'Gemini AI',         style: { background: 'oklch(0.6 0.18 250)', color: '#fff' } },
}

const generateMsgId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`

export default function AIChat() {
  const { locale, connectivity } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)

  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = {
      id: generateMsgId('m'),
      role: 'user',
      text: text.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const response = await api.aiChat(text.trim(), locale)
      const aiMsg = {
        id: generateMsgId('m-ai'),
        role: 'ai',
        text: response.response || response.reply || $('AI_CHAT_ERR_FAILED', locale),
        source: response.source,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
      const aiMsg = {
        id: generateMsgId('m-ai'),
        role: 'ai',
        text: $('AI_CHAT_ERR_OFFLINE', locale),
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

  const t = (en, bn) => (locale === 'en' ? en : bn)

  return (
    <MobileLayout
      title={$('PAGE_TITLE_AI_CHAT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in">
        {/* Chat Container Card */}
        <div style={{ height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-primary) 6%, transparent)', boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.01)' }}>
          
          {/* Scrollable messages zone */}
          <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 ? (
              /* Empty state placeholder */
              <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px', margin: 'auto' }}>
                <div style={{ display: 'grid', height: '64px', width: '64px', placeItems: 'center', borderRadius: '16px', background: 'color-mix(in oklab, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)', marginBottom: '20px' }}>
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 750, color: 'var(--color-text)' }}>
                  {t('How are you feeling today?', 'আজ আপনি কেমন অনুভব করছেন?')}
                </h3>
                <p className="muted" style={{ maxWidth: '380px', marginTop: '8px', lineHeight: 1.55, fontSize: '13.5px' }}>
                  {t(
                    'Describe your symptoms in your own words. PulseGuard AI works offline and your data stays on your device.',
                    'আপনার নিজের ভাষায় লক্ষণগুলি বর্ণনা করুন। PulseGuard AI অফলাইনে কাজ করে এবং আপনার ডেটা আপনার ডিভাইসে থাকে।'
                  )}
                </p>
              </div>
            ) : (
              /* Render messages */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{ display: 'flex', width: '100%', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div className={`chat-bubble ${msg.role}`} style={{
                    maxWidth: '80%',
                    borderRadius: '16px',
                    padding: '12px 18px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--color-surface)',
                    color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                    boxShadow: msg.role === 'user' ? 'var(--shadow-glow-primary)' : 'none'
                  }}>
                    {msg.role === 'ai' && SOURCE_BADGE[msg.source] && (
                      <span 
                        style={{
                          display: 'inline-block',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          marginBottom: '8px',
                          ...SOURCE_BADGE[msg.source].style
                        }}
                      >
                        {SOURCE_BADGE[msg.source].label}
                      </span>
                    )}
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => {
                          const text = String(children)
                          if (text.startsWith('Warning:') || text.startsWith('সতর্কবার্তা:')) {
                            return (
                              <p className="ai-warning" style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 0' }}>
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>{children}</span>
                              </p>
                            )
                          }
                          return <p style={{ margin: 0, lineHeight: '1.6' }}>{children}</p>
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }}>
                <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '16px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  <div className="typing-indicator">
                    <span style={{ animationDelay: '0ms' }} />
                    <span style={{ animationDelay: '150ms' }} />
                    <span style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Bottom input area */}
          <div style={{ padding: '16px 24px', background: 'transparent' }}>
            
            {/* Quick Chips Row */}
            <div className="chip-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {quickChips.map((chip) => (
                <button
                  type="button"
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  style={{
                    borderRadius: '9999px',
                    border: '1px solid color-mix(in oklab, var(--color-primary) 30%, transparent)',
                    backgroundColor: 'color-mix(in oklab, var(--color-primary) 10%, transparent)',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                    transition: 'all var(--duration-fast)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--color-primary) 20%, transparent)' }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--color-primary) 10%, transparent)' }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={$('AI_CHAT_PH', locale)}
                aria-label="Describe your symptoms"
                style={{
                  flex: 1,
                  height: '48px',
                  borderRadius: '9999px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  padding: '0 20px',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--color-text)',
                  transition: 'border-color var(--duration-fast)'
                }}
              />

              <button
                type="submit"
                className="btn btn--primary"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Send className="h-4 w-4" />
                <span>{$('AI_CHAT_SEND', locale)}</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </MobileLayout>
  )
}
