import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { chatMessages as initialMessages } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'
import ReactMarkdown from 'react-markdown';
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

const quickChips = ['Headache', 'Fever', 'Dizziness', 'Nausea', 'Swelling']

export default function AIChat() {
  const { locale, connectivity } = useApp()
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
        text: response.response || response.reply || $('AI_CHAT_ERR_FAILED', locale),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
      const aiMsg = {
        id: `m-${Date.now()}-ai`,
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

  return (
    <MobileLayout
      title={$('PAGE_TITLE_AI_CHAT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
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
              placeholder={$('AI_CHAT_PH', locale)}
              aria-label="Describe your symptoms"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="button" className="icon-btn" title="Voice input" aria-label="Voice input">
              
            </button>
            <button type="submit" className="btn btn--primary">
              {$('AI_CHAT_SEND', locale)}
            </button>
          </div>
        </form>

        <div className="chip-row" style={{ marginTop: '1rem' }}>
          {quickChips.map((chip) => (
            <button
              type="button"
              key={chip}
              className="chip"
              onClick={() => sendMessage(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}
