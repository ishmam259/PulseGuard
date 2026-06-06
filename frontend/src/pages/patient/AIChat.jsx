import { useState, useRef, useEffect } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import ReactMarkdown from 'react-markdown';
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

const CHIP_KEYS = [
  'AI_CHAT_CHIP_HEADACHE',
  'AI_CHAT_CHIP_FEVER',
  'AI_CHAT_CHIP_DIZZINESS',
  'AI_CHAT_CHIP_NAUSEA',
  'AI_CHAT_CHIP_SWELLING',
]

const SOURCE_BADGE = {
  offline: { label: 'Offline Answer', style: { background: '#f59e0b', color: '#fff' } },
  gemini:  { label: 'Gemini',         style: { background: '#4f46e5', color: '#fff' } },
}

export default function AIChat() {
  const { locale, connectivity } = useApp()
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

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

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    setShowSidebar(false)
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

  return (
    <MobileLayout
      title={$('PAGE_TITLE_AI_CHAT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <style>{`
        .ai-chat-layout-container {
          display: flex;
          height: calc(100vh - 200px);
          min-height: 500px;
          gap: 1.25rem;
          position: relative;
        }

        /* ── Sidebar ── */
        .ai-chat-sidebar {
          width: 280px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .new-chat-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1.5px dashed var(--color-primary);
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.05);
          color: var(--color-primary);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .new-chat-btn:hover {
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.1);
          border-style: solid;
          transform: translateY(-1px);
        }
        .sidebar-search-wrapper {
          position: relative;
        }
        .sidebar-search-input {
          width: 100%;
          padding: 0.6rem 1rem 0.6rem 2.25rem;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          color: var(--color-text);
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .sidebar-search-input:focus {
          border-color: var(--color-primary);
        }
        .sidebar-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted);
          pointer-events: none;
          font-size: 0.9rem;
        }
        .sidebar-list-title {
          padding: 0.75rem 1.25rem 0.25rem 1.25rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
          font-weight: 700;
        }
        .sidebar-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          text-align: left;
          width: 100%;
        }
        .sidebar-item:hover {
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.05);
        }
        .sidebar-item.active {
          background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.12);
          color: var(--color-primary);
          font-weight: 700;
        }
        .sidebar-item-title {
          font-size: 0.88rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 0.5rem;
        }
        .sidebar-item-delete {
          background: transparent;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 6px;
          opacity: 0;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-item:hover .sidebar-item-delete {
          opacity: 1;
        }
        .sidebar-item-delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        /* ── Main Chat Area ── */
        .ai-chat-main-panel {
          flex: 1;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        .chat-header-bar {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-surface);
        }
        .menu-toggle-btn {
          display: none;
          background: transparent;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--color-text);
          padding: 0.25rem 0.5rem;
        }
        .chat-body-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .empty-chat-welcome {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
          text-align: center;
        }
        .empty-chat-welcome h3 {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .empty-chat-welcome p {
          max-width: 320px;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .menu-toggle-btn {
            display: block;
          }
          .ai-chat-sidebar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 50;
            width: 280px;
            transform: translateX(-100%);
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.35);
          }
          .ai-chat-sidebar.open {
            transform: translateX(0);
          }
          .sidebar-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(2px);
            z-index: 40;
            display: block;
          }
        }
        @media (min-width: 769px) {
          .sidebar-backdrop {
            display: none;
          }
        }
      `}</style>

      <div className="ai-chat-layout-container animate-fade-in">
        {/* Backdrop for mobile drawer */}
        {showSidebar && (
          <div className="sidebar-backdrop" onClick={() => setShowSidebar(false)} />
        )}

        {/* ── Chat Sidebar (Sessions + Search) ── */}
        <aside className={`ai-chat-sidebar ${showSidebar ? 'open' : ''}`}>
          <div className="sidebar-header">
            <button type="button" className="new-chat-btn" onClick={handleCreateNewChat}>
              <span>➕</span>
              <span>{$('AI_CHAT_NEW_CHAT', locale)}</span>
            </button>
            <div className="sidebar-search-wrapper">
              <span className="sidebar-search-icon">🔍</span>
              <input
                type="text"
                className="sidebar-search-input"
                placeholder={$('AI_CHAT_SEARCH_CHATS', locale)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="sidebar-list-title">{$('AI_CHAT_RECENT', locale)}</div>
          <div className="sidebar-list">
            {chats.length === 0 ? (
              <p className="muted text-center" style={{ fontSize: '0.8rem', padding: '1rem' }}>
                {$('AI_CHAT_NO_CHATS', locale)}
              </p>
            ) : (
              chats.map((chat) => (
                <button
                  type="button"
                  key={chat.id}
                  className={`sidebar-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveChatId(chat.id)
                    setShowSidebar(false)
                  }}
                >
                  <span className="sidebar-item-title">{chat.title}</span>
                  <button
                    type="button"
                    className="sidebar-item-delete"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    title="Delete Chat"
                  >
                    🗑️
                  </button>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Main Chat Area ── */}
        <div className="ai-chat-main-panel">
          {/* Header Bar */}
          <div className="chat-header-bar">
            <button
              type="button"
              className="menu-toggle-btn"
              onClick={() => setShowSidebar(true)}
              title="Open history"
            >
              ☰
            </button>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {activeChatId
                ? (chats.find(c => c.id === activeChatId)?.title || $('PAGE_TITLE_AI_CHAT', locale))
                : $('AI_CHAT_NEW_CHAT', locale)}
            </span>
            <div style={{ width: 28 }} /> {/* Spacer */}
          </div>

          {/* Chat Bubble List */}
          <div className="chat-body-container">
            {messages.length === 0 ? (
              <div className="empty-chat-welcome animate-fade-in">
                <h3>PulseGuard AI</h3>
                <p className="muted">
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
            <div ref={bottomRef} />
          </div>

          {/* Chat Form & Quick Chips */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <form onSubmit={handleSubmit} style={{ marginBottom: '0.75rem' }}>
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
                >
                  {isListening ? '⏹' : '🎙'}
                </button>
                <button type="submit" className="btn btn--primary">
                  {$('AI_CHAT_SEND', locale)}
                </button>
              </div>
            </form>

            <div className="chip-row">
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
        </div>
      </div>
    </MobileLayout>
  )
}
