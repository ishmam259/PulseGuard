import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { chatMessages as initialMessages } from '../../data/mockData'
import { patientNavItems } from '../../data/navItems'

const quickChips = ['Headache', 'Fever', 'Dizziness', 'Nausea', 'Swelling']

export default function AIChat() {
  const [messages, setMessages] = useState(
    initialMessages.map((m) => ({ ...m }))
  )
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
        text: response.response || response.reply || 'Sorry, I couldn\'t process that request.',
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
      const aiMsg = {
        id: `m-${Date.now()}-ai`,
        role: 'ai',
        text: 'Sorry, the AI service is currently offline or unreachable. Please try again later.',
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
      title="AI Symptom Checker"
      status="online"
      navItems={patientNavItems}
    >
      <div className="animate-fade-in">
        <div className="card chat-card">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              {msg.text}
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

        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <input
              type="text"
              className="input"
              placeholder="Describe your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="button" className="icon-btn" title="Voice input">
              
            </button>
            <button type="submit" className="btn btn--primary">
              Send
            </button>
          </div>
        </form>

        <div className="chip-row">
          {quickChips.map((chip) => (
            <button
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
