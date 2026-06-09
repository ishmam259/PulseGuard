import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import ReactMarkdown from 'react-markdown'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import { History, Pencil, Trash2, Mic, Square, Search } from 'lucide-react'

const CHIP_KEYS = [
  'AI_CHAT_CHIP_HEADACHE',
  'AI_CHAT_CHIP_FEVER',
  'AI_CHAT_CHIP_DIZZINESS',
  'AI_CHAT_CHIP_NAUSEA',
  'AI_CHAT_CHIP_SWELLING',
]

const SOURCE_BADGE = {
  offline: { label: 'Offline Answer', style: { background: 'oklch(0.72 0.16 50)', color: '#fff' } },
  gemini:  { label: 'Gemini AI',         style: { background: 'oklch(0.6 0.18 250)', color: '#fff' } },
}

const generateMsgId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`

export default function AIChat() {
  const { locale, connectivity } = useApp()
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)


  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  const chatContainerRef = useRef(null)
  const recognitionRef = useRef(null)
  const chatCardRef = useRef(null)
  const sendingFirstMessageRef = useRef(false)

  // 1. Load chat sessions list on mount & query changes
  useEffect(() => {
    loadChatsList()
  }, [searchQuery])

  // 2. Load messages when active session changes
  useEffect(() => {
    async function loadChatMessages() {
      if (!activeChatId) {
        setMessages([])
        return
      }
      if (sendingFirstMessageRef.current) {
        // Skip fetching because we just dynamically created this chat session
        // and handleSend is actively posting the first message.
        sendingFirstMessageRef.current = false
        return
      }
      try {
        const res = await api.getAIChat(activeChatId)
        if (res && res.chat) {
          setMessages(res.chat.messages || [])
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err)
      }
    }
    loadChatMessages()
  }, [activeChatId])

  // Scroll to bottom on new messages (scoped scroll - prevents parent page layout shift)
  useEffect(() => {
    if (chatCardRef.current) {
      chatCardRef.current.scrollTo({
        top: chatCardRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, isTyping])

  const loadChatsList = async () => {
    try {
      const data = await api.getAIChats(searchQuery)
      setChats(data || [])
    } catch (err) {
      console.error('Failed to load chat history:', err)
    }
  }

  const handleCreateNewChat = () => {
    setActiveChatId(null)
    setMessages([])
  }

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation()
    const confirmText = $('AI_CHAT_DELETE_CONFIRM', locale)
    if (!window.confirm(confirmText)) return
    try {
      const ok = await api.deleteAIChat(id)
      if (ok) {
        if (activeChatId === id) {
          setActiveChatId(null)
          setMessages([])
        }
        loadChatsList()
      }
    } catch (err) {
      console.error('Failed to delete chat:', err)
    }
  }

  const handleSend = async (text) => {
    if (!text.trim()) return

    // Add optimistic user message bubble
    const userMsg = {
      id: `m-temp-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      let currentId = activeChatId

      // 1. If no active session, create one dynamically
      if (!currentId) {
        const sessionTitle = text.slice(0, 35) + (text.length > 35 ? '...' : '')
        const res = await api.createAIChat(sessionTitle)
        if (!res || !res.chat) throw new Error('Could not create new session')
        currentId = res.chat.id
        sendingFirstMessageRef.current = true
        setActiveChatId(currentId)
      }

      // 2. Post message to persistent chat session
      const response = await api.sendAIChatMessage(currentId, text.trim(), locale)

      // 3. Set the full state array from database response
      if (response && response.chat) {
        setMessages(response.chat.messages || [])
        loadChatsList() // refresh list to update title/sorting order
      } else {
        // Fallback in case of server payload mismatch
        const aiMsg = {
          id: `m-ai-err-${Date.now()}`,
          role: 'ai',
          text: response.response || $('AI_CHAT_ERR_FAILED', locale),
          source: response.source || 'offline',
        }
        setMessages((prev) => [...prev, aiMsg])
      }
    } catch (err) {
      console.error('AI chat send error:', err)
      const aiMsg = {
        id: `m-ai-err-${Date.now()}`,
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
    handleSend(input)
  }

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert($('AI_CHAT_VOICE_NOT_SUPPORTED', locale))
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = locale === 'bn' ? 'bn-BD' : 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setIsListening(true)
    recognition.onend   = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      if (locale === 'bn') {
        setInput(transcript)
      } else {
        handleSend(transcript)
      }
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  const t = (en, bn) => (locale === 'en' ? en : bn)

  return (
    <MobileLayout
      title={$('PAGE_TITLE_AI_CHAT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <style>{`
        /* ── History Modal ── */
        .history-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }
        .history-modal-content {
          background: var(--color-bg-start);
          border: 1px solid var(--color-border-light);
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          box-shadow: var(--shadow-elevated);
          display: flex;
          flex-direction: column;
          max-height: 80%;
          overflow: hidden;
          animation: modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalFadeIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .history-modal-header {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .history-modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text);
        }
        .history-modal-close {
          background: transparent;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: var(--color-muted);
          padding: 0.2rem;
          transition: color 0.2s;
        }
        .history-modal-close:hover {
          color: var(--color-text);
        }
        .history-modal-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }
        .modal-search-wrapper {
          position: relative;
        }
        .modal-search-wrapper .input {
          padding-left: 2.25rem !important;
        }
        .modal-search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted);
          pointer-events: none;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-chats-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
        }
        .modal-chat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .modal-chat-item:hover {
          border-color: var(--color-primary);
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.04);
        }
        .modal-chat-item.active {
          border-color: var(--color-primary);
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.1);
        }
        .modal-chat-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 0.75rem;
        }
        .modal-chat-title.active {
          color: var(--color-primary);
          font-weight: 700;
        }
        .modal-chat-delete {
          background: transparent;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-chat-delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .ai-chat-wrapper {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 240px);
          min-height: 400px;
        }
        @media (min-width: 768px) {
          .ai-chat-wrapper {
            height: calc(100vh - 180px);
            min-height: 480px;
          }
        }
        .ai-chat-wrapper .chat-card {
          flex: 1;
          min-height: 0 !important;
          height: auto !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .ai-chat-wrapper .text-gradient {
          background: none !important;
          -webkit-background-clip: initial !important;
          background-clip: initial !important;
          -webkit-text-fill-color: var(--color-primary) !important;
          color: var(--color-primary) !important;
        }
        .ai-chat-wrapper .btn--primary {
          background: var(--color-primary) !important;
          background-image: none !important;
          border-color: var(--color-primary) !important;
        }
        .ai-chat-wrapper .btn--primary:hover {
          background: var(--color-primary-light) !important;
          background-image: none !important;
          border-color: var(--color-primary-light) !important;
        }
        .ai-chat-wrapper .chat-bubble.user {
          background: var(--color-primary) !important;
          background-image: none !important;
          border-color: var(--color-primary) !important;
        }
        .ai-chat-wrapper .icon-btn--listening {
          border-color: var(--color-primary) !important;
          background: var(--color-primary-dim) !important;
          animation: pulse-ring-primary 1.2s ease-in-out infinite !important;
        }
        .ai-chat-wrapper .typing-indicator {
          background: var(--color-primary-dim) !important;
          border-color: var(--color-primary-glow) !important;
        }
        .ai-chat-wrapper .chip:hover {
          background: color-mix(in oklab, var(--color-primary) 25%, transparent) !important;
          border-color: var(--color-primary) !important;
        }
        @keyframes pulse-ring-primary {
          0%, 100% { box-shadow: 0 0 0 0 var(--color-primary-glow); }
          50%       { box-shadow: 0 0 0 6px transparent; }
        }
      `}</style>,StartLine:369,TargetContent:

      <div className="animate-fade-in ai-chat-wrapper">
        {/* Header Actions Bar sitting outside/above the card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            title={$('AI_CHAT_RECENT', locale)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
          >
            <History size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>
            {activeChatId
              ? (chats.find(c => c.id === activeChatId)?.title || $('PAGE_TITLE_AI_CHAT', locale))
              : $('AI_CHAT_NEW_CHAT', locale)}
          </span>
          <button
            type="button"
            onClick={handleCreateNewChat}
            title={$('AI_CHAT_NEW_CHAT', locale)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
          >
            <Pencil size={20} />
          </button>
        </div>

        {/* NATIVE chat-card: Identical to original code sizing */}
        <div ref={chatCardRef} className="card chat-card">
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
              <h3 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>PulseGuard AI</h3>
              <p className="muted" style={{ maxWidth: '360px', lineHeight: 1.6 }}>
                {locale === 'bn'
                  ? 'আপনার স্বাস্থ্যের জন্য কোনো লক্ষণ বা প্রশ্ন রয়েছে কি? শুরু করতে নিচে লক্ষণ নির্বাচন করুন অথবা টাইপ করুন।'
                  : 'Have symptoms or questions about your pregnancy health? Describe them below or choose a helper tag.'}
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.role}`}>
                {msg.role === 'ai' && SOURCE_BADGE[msg.source] && (
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    marginBottom: '6px',
                    ...SOURCE_BADGE[msg.source].style,
                  }}>
                    {SOURCE_BADGE[msg.source].label}
                  </span>
                )}
                <ReactMarkdown
                  components={{
                    p: ({ children }) => {
                      const text = String(children);
                      if (text.startsWith('Warning:') || text.startsWith('সতর্কবার্তা:')) {
                        return <p className="ai-warning">{children}</p>;
                      }
                      return <p>{children}</p>;
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))
          )}
          {isTyping && (
            <div className="chat-bubble ai">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {/* Input row sitting outside card */}
        <form onSubmit={handleSubmit} style={{ margin: '1rem 0', flexShrink: 0 }}>
          <div className="input-row">
            <input
              type="text"
              className="input"
              placeholder={$('AI_CHAT_PH', locale)}
              aria-label="Describe your symptoms"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="button"
              className={`icon-btn${isListening ? ' icon-btn--listening' : ''}`}
              title={isListening ? $('AI_CHAT_VOICE_LISTENING', locale) : 'Voice input'}
              aria-label={isListening ? $('AI_CHAT_VOICE_LISTENING', locale) : 'Voice input'}
              onClick={startVoice}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isListening ? <Square size={16} /> : <Mic size={16} />}
            </button>
            <button type="submit" className="btn btn--primary">
              {$('AI_CHAT_SEND', locale)}
            </button>
          </div>
        </form>

        {/* Chips row sitting below form */}
        <div className="chip-row" style={{ marginTop: '0.5rem', flexShrink: 0 }}>
          {CHIP_KEYS.map((key) => (
            <button
              type="button"
              key={key}
              className="chip"
              onClick={() => handleSend($(key, locale))}
            >
              {$(key, locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible History Modal */}
      {isHistoryOpen && (
        <div className="history-modal-overlay" onClick={() => setIsHistoryOpen(false)}>
          <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal-header">
              <h3>{$('AI_CHAT_RECENT', locale)}</h3>
              <button type="button" className="history-modal-close" onClick={() => setIsHistoryOpen(false)}>
                ✕
              </button>
            </div>
            
            <div className="history-modal-body">
              {/* Search Bar inside Modal */}
              <div className="modal-search-wrapper">
                <span className="modal-search-icon">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="input modal-search-input"
                  placeholder={$('AI_CHAT_SEARCH_CHATS', locale)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Chats List */}
              <div className="modal-chats-list">
                {chats.length === 0 ? (
                  <p className="muted text-center" style={{ padding: '1rem' }}>
                    {$('AI_CHAT_NO_CHATS', locale)}
                  </p>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`modal-chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveChatId(chat.id)
                        setIsHistoryOpen(false)
                      }}
                    >
                      <span className={`modal-chat-title ${activeChatId === chat.id ? 'active' : ''}`}>
                        {chat.title}
                      </span>
                      <button
                        type="button"
                        className="modal-chat-delete"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        title="Delete Chat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  )
}
