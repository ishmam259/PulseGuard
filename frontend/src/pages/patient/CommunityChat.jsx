import { useState, useRef, useEffect, useCallback } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import { Users } from 'lucide-react'

const TYPING_DEBOUNCE_MS = 1500
const TYPING_STOP_MS = 5000

<<<<<<< HEAD
const typingAudio = new Audio('/assets/sounds/typing.mp3')
typingAudio.volume = 0.2

=======
>>>>>>> cfa5b138b4a1158effe8cf402fb94141fe66ca85
function displayName(userId) {
  if (!userId) return 'User'
  const id = userId.startsWith('@') ? userId.slice(1).split(':')[0] : userId
  return `${id.replace(/^patient_/, '').slice(0, 8)}`
}

export default function CommunityChat() {
  const { locale, connectivity, currentUser } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [online, setOnline] = useState([])
  const [typing, setTyping] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
<<<<<<< HEAD
  
  const bottomRef = useRef(null)
=======
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimerRef = useRef(null)
>>>>>>> cfa5b138b4a1158effe8cf402fb94141fe66ca85
  const typingStopRef = useRef(null)
  const isTypingRef = useRef(false)
  const lastTypingSentRef = useRef(0)
  const wsRef = useRef(null)
  const inputDebounceRef = useRef(null)

  const selfId = currentUser ? `patient_${currentUser.id}` : null
  const isSelf = useCallback((sender) => !!selfId && sender === selfId, [selfId])

  // WebSocket lifecycle
  useEffect(() => {
    if (!currentUser || !selfId) return
    let cancelled = false

    const loadHistory = async () => {
      try {
        const history = await api.getCommunityChatHistory('global')
        if (cancelled) return
<<<<<<< HEAD
        
        // Only show actual messages in the history
        const messagesOnly = history.filter(m => m.type === 'MESSAGE')

        const mapped = messagesOnly.map(m => ({
          id: `${m.userId}-${m.timestamp || m.id || Date.now()}`,
          sender: m.userId,
          body: m.message,
          ts: m.timestamp ? new Date(m.timestamp).getTime() : Date.now()
        }))
        
        // Sort ascending by time
        mapped.sort((a, b) => a.ts - b.ts)
        setMessages(mapped)
=======
        if (first.ok) {
          const ascending = [...(first.messages || [])].reverse()
          setMessages(ascending)
          lastEndRef.current = first.end || null
          setConnected(true)
        } else {
          setError(first.error?.error || $('COMMUNITY_ERR_LOAD', locale))
        }
>>>>>>> cfa5b138b4a1158effe8cf402fb94141fe66ca85
      } catch (err) {
        console.error('Failed to load history', err)
      }
    }

    const handlers = {
      onOpen: () => {
        if (cancelled) return
        console.log('Community Chat: Connected')
        setConnected(true)
        setLoading(false)
        setError(null)
        // Let server handle timestamp and id generation
        wsRef.current?.send(JSON.stringify({ 
          userId: selfId, 
          type: 'JOIN'
        }))
        setOnline((prev) => prev.includes(selfId) ? prev : [...prev, selfId])
      },
      onMessage: (data) => {
        if (cancelled) return
        console.log('Community Chat: Message received', data)

        if (data.type === 'MESSAGE') {
          setMessages((prev) => {
            const msgId = `${data.userId}-${data.timestamp || Date.now()}`
            if (prev.find(m => m.id === msgId)) return prev
            
            const next = [...prev, {
              id: msgId,
              sender: data.userId,
              body: data.message,
              ts: data.timestamp ? new Date(data.timestamp).getTime() : Date.now()
            }]
            next.sort((a, b) => a.ts - b.ts)
            return next
          })
        } else if (data.type === 'TYPING') {
          if (data.userId === selfId) return
          if (data.message === 'STOP') {
            setTyping((prev) => prev.filter(u => u.id !== data.userId))
            return
          }
          // Store typing users with a timestamp to allow fresh updates to extend the duration
          setTyping((prev) => {
            const now = Date.now()
            const exists = prev.find(u => u.id === data.userId)
            if (exists) {
              return prev.map(u => u.id === data.userId ? { ...u, ts: now } : u)
            }
            return [...prev, { id: data.userId, ts: now }]
          })
        } else if (data.type === 'JOIN') {
          if (data.userId === selfId) return
          setOnline((prev) => prev.includes(data.userId) ? prev : [...prev, data.userId])
          // Removed Echo JOIN logic to prevent infinite loops (Code 1011)
        } else if (data.type === 'LEAVE') {
          setOnline((prev) => prev.filter(u => u !== data.userId))
          setTyping((prev) => prev.filter(u => u.id !== data.userId))
        }
      },
      onClose: (e) => {
        if (cancelled) return
        console.warn('Community Chat: Connection closed', e.code, e.reason)
        setConnected(false)
        setLoading(false)
      },
      onError: (err) => {
        if (cancelled) return
        console.error('Community Chat: WebSocket Error', err)
        setError($('COMMUNITY_ERR_LOAD', locale))
        setLoading(false)
        setConnected(false)
      }
    }

    const init = async () => {
      await loadHistory()
      if (cancelled) return
      
      try {
        wsRef.current = api.connectCommunityChat('global', handlers)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || $('COMMUNITY_ERR_LOAD', locale))
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      cancelled = true
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ userId: selfId, type: 'LEAVE' }))
        }
        wsRef.current.close()
      }
    }
  }, [currentUser, locale, selfId])

  // Prune expired typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      setTyping((prev) => {
        const now = Date.now()
        const next = prev.filter(u => now - u.ts < 4000)
        return next.length === prev.length ? prev : next
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Sync typing audio with indicator state
  useEffect(() => {
    if (typing.length > 0) {
      if (typingAudio.paused) {
        typingAudio.loop = true
        typingAudio.play().catch(() => {})
      }
    } else {
      typingAudio.pause()
      typingAudio.currentTime = 0
    }
  }, [typing.length])

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, typing])

<<<<<<< HEAD
=======
  // Polling: live tail via `dir=f&from=<end>`. In Conduit's pagination
  // model, the `end` token returned by any messages query is the
  // anchor for forward pagination — passing it as `from` with `dir=f`
  // returns only events strictly newer than that anchor. This picks
  // up new messages from any sender within ~POLL_MS.
  useEffect(() => {
    if (!connected) return
    const t = setInterval(async () => {
      try {
        const r = await api.getChatMessages(lastEndRef.current, { dir: 'f', limit: 50 })
        if (!r.ok) return
        if (r.messages && r.messages.length > 0) {
          // `dir=f` returns events in chronological order. Merge with
          // de-dup, then re-sort the full list by `ts` so optimistic
          // sends (which use Date.now()) and server messages line up
          // correctly even if the client clock is slightly off.
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id))
            const fresh = r.messages.filter((m) => !seen.has(m.id))
            if (fresh.length === 0) return prev
            const merged = [...prev, ...fresh]
            merged.sort((a, b) => (a.ts || 0) - (b.ts || 0))
            return merged
          })
        }
        // Always advance the cursor, even when the message list is
        // empty — otherwise we'd re-poll the same anchor and never
        // make forward progress.
        if (r.end) {
          lastEndRef.current = r.end
        }
      } catch {
        // swallow — next tick will retry
      }
    }, POLL_MS)
    return () => clearInterval(t)
  }, [connected])

  // Polling: presence + typing (every 5s)
  useEffect(() => {
    if (!connected) return
    const fetchOnce = async () => {
      const r = await api.getChatPresence()
      if (r.ok) {
        setOnline(r.online || [])
        setTyping((r.typing || []).filter((u) => u !== selfConduitId))
      }
    }
    fetchOnce()
    const t = setInterval(fetchOnce, POLL_MS)
    return () => clearInterval(t)
  }, [connected, selfConduitId])

  // Cleanup: send typing=false on unmount and on tab close
  useEffect(() => {
    function stopTyping() {
      if (isTypingRef.current) {
        isTypingRef.current = false
        api.setChatTyping(false)
      }
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') stopTyping()
    }
    window.addEventListener('beforeunload', stopTyping)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stopTyping()
      window.removeEventListener('beforeunload', stopTyping)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

>>>>>>> cfa5b138b4a1158effe8cf402fb94141fe66ca85
  const onInputChange = (e) => {
    const v = e.target.value
    setInput(v)
    
    if (!v) {
      if (isTypingRef.current) {
        isTypingRef.current = false
        wsRef.current?.send(JSON.stringify({ 
          userId: selfId, 
          type: 'TYPING',
          message: 'STOP'
        }))
      }
      return
    }

    // Send TYPING periodically while typing
    const now = Date.now()
    if (connected && (!isTypingRef.current || now - lastTypingSentRef.current > 3000)) {
      isTypingRef.current = true
      lastTypingSentRef.current = now
      console.log('Community Chat: Sending TYPING status')
      wsRef.current?.send(JSON.stringify({ 
        userId: selfId, 
        type: 'TYPING'
      }))
    }

    // Reset the "isTyping" local state after 4 seconds of no activity
    if (typingStopRef.current) clearTimeout(typingStopRef.current)
    typingStopRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        wsRef.current?.send(JSON.stringify({ 
          userId: selfId, 
          type: 'TYPING',
          message: 'STOP'
        }))
      }
    }, 4000)
  }

  const sendMessage = async (e) => {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text || !connected || !wsRef.current) return
    
    setSending(true)
    try {
      wsRef.current.send(JSON.stringify({
        userId: selfId,
        message: text,
        type: 'MESSAGE'
      }))
      setInput('')
      if (isTypingRef.current) {
        isTypingRef.current = false
        wsRef.current.send(JSON.stringify({ 
          userId: selfId, 
          type: 'TYPING',
          message: 'STOP'
        }))
      }
    } catch (err) {
      console.error('Send failed', err)
    } finally {
      setSending(false)
    }
  }

  const rendered = []
  let lastSender = null
  for (const m of messages) {
    rendered.push({ ...m, _groupStart: m.sender !== lastSender })
    lastSender = m.sender
  }

  const typingLabel = (() => {
    if (!typing || typing.length === 0) return null
    const names = typing.map(u => displayName(u.id)).join(', ')
    return typing.length === 1 
      ? `${displayName(typing[0].id)} ${$('COMMUNITY_TYPING', locale)}`
      : `${names} ${$('COMMUNITY_TYPING_MULTI', locale)}`
  })()

  return (
    <MobileLayout
      title={$('PAGE_TITLE_COMMUNITY_CHAT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
<<<<<<< HEAD
      <div className="animate-fade-in">
        <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span aria-hidden="true">{connected ? '🟢' : '⚪'}</span>
            <strong>{online.length}</strong>
            <span className="muted">{$('COMMUNITY_ONLINE_SUFFIX', locale)}</span>
            {!connected && !loading && !error && (
              <span className="muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>Disconnected</span>
            )}
          </div>
          <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
            {$('COMMUNITY_DISCLAIMER', locale)}
          </p>
        </div>

=======
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
>>>>>>> cfa5b138b4a1158effe8cf402fb94141fe66ca85
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: '400px', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-primary) 6%, transparent)', boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.01)', padding: '4rem 2rem', alignItems: 'center', justifyContent: 'center' }}>
            <p className="muted animate-pulse">{$('COMMUNITY_LOADING', locale)}</p>
          </div>
        ) : error ? (
<<<<<<< HEAD
          <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-danger)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
            <button className="btn btn--ghost" style={{ marginTop: '0.5rem', padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <div className="card chat-card" data-testid="community-chat-thread" style={{ height: '55vh', minHeight: '350px' }}>
            {rendered.length === 0 && typing.length === 0 ? (
              <p className="muted text-center" style={{ padding: '1.5rem 0' }}>
                {$('COMMUNITY_EMPTY', locale)}
              </p>
            ) : (
              <>
                {rendered.map((m) => (
                  <div
                    key={m.id}
                    className={`chat-bubble ${isSelf(m.sender) ? 'user' : 'ai'}`}
                    style={{ marginBottom: '0.4rem' }}
                  >
                    {m._groupStart && (
                      <div className="muted" style={{ fontSize: '0.7rem', marginBottom: '2px' }}>
                        {isSelf(m.sender) ? $('COMMUNITY_DISPLAY_NAME_PREFIX', locale) : displayName(m.sender)}
                      </div>
                    )}
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.body}</div>
                  </div>
                ))}

                {typing.length > 0 && (
                  <div className="chat-bubble ai" style={{ marginBottom: '0.4rem', background: 'transparent', border: 'none', padding: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="typing-indicator" style={{ padding: '8px 12px' }}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="muted" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                        {typingLabel}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <form onSubmit={sendMessage} style={{ margin: '1rem 0' }}>
          <div className="input-row">
            <input
              type="text"
              className="input"
              placeholder={$('COMMUNITY_PH', locale)}
              aria-label="Community message"
              value={input}
              onChange={onInputChange}
              disabled={loading || !!error || sending}
              maxLength={4000}
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!connected || !input.trim() || sending}
            >
              {$('COMMUNITY_SEND', locale)}
            </button>
          </div>
        </form>
=======
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: '400px', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-danger)', padding: '24px' }}>
            <p style={{ margin: 0, color: 'var(--color-danger)' }}>{error}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: '400px', borderRadius: '24px', overflow: 'hidden', backgroundColor: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-primary) 6%, transparent)', boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.01)' }}>
            
            {/* Integrated Chat Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              <div style={{ display: 'grid', height: '40px', width: '40px', placeItems: 'center', borderRadius: '50%', backgroundColor: 'color-mix(in oklab, var(--color-primary) 8%, transparent)', color: 'var(--color-primary)' }}>
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--color-text)' }}>
                  {locale === 'en' ? 'All PulseGuard Mothers' : 'সকল পালসগার্ড মায়েরা'}
                </h4>
                <p className="muted" style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  {online.length} {locale === 'en' ? 'online' : 'অনলাইন'}
                  {typingLabel && <span style={{ fontStyle: 'italic', marginLeft: '8px' }}>· {typingLabel}</span>}
                </p>
              </div>
            </div>
            
            {/* Chat Thread */}
            <div 
              data-testid="community-chat-thread" 
              ref={messagesContainerRef}
              style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {rendered.length === 0 ? (
                <p className="muted text-center" style={{ padding: '3rem 0' }}>
                  {$('COMMUNITY_EMPTY', locale)}
                </p>
              ) : (
                rendered.map((m) => {
                  const self = isSelf(m.sender);
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: self ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: self ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {m._groupStart && (
                        <span className="muted" style={{ fontSize: '11px', marginBottom: '4px', fontWeight: '500', padding: '0 4px' }}>
                          {self ? $('COMMUNITY_DISPLAY_NAME_PREFIX', locale) : displayName(m.sender)}
                        </span>
                      )}
                      <div 
                        style={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          padding: '12px 18px',
                          borderRadius: '16px',
                          fontSize: '14px',
                          lineHeight: '1.45',
                          background: self ? 'var(--gradient-primary)' : 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                          color: self ? '#ffffff' : 'var(--color-text)',
                          border: self ? 'none' : '1px solid var(--color-border)',
                          boxShadow: self ? 'var(--shadow-glow-primary)' : 'none'
                        }}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <form 
              onSubmit={sendMessage} 
              style={{ 
                padding: '16px 24px', 
                borderTop: '1px solid var(--color-border)', 
                background: 'color-mix(in oklab, var(--color-surface) 80%, transparent)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '9999px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'color-mix(in oklab, var(--color-surface) 60%, transparent)',
                    padding: '0 20px',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--color-text)',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  placeholder={$('COMMUNITY_PH', locale)}
                  aria-label="Community message"
                  value={input}
                  onChange={onInputChange}
                  disabled={!connected || loading || !!error}
                  maxLength={4000}
                />
                <button
                  type="submit"
                  className="btn btn--primary"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '9999px',
                    padding: '0 24px',
                    height: '48px',
                    boxShadow: 'var(--shadow-glow-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600'
                  }}
                  disabled={!connected || !input.trim() || sending}
                >
                  {$('COMMUNITY_SEND', locale)}
                </button>
              </div>
            </form>

          </div>
        )}
>>>>>>> cfa5b138b4a1158effe8cf402fb94141fe66ca85
      </div>
    </MobileLayout>
  )
}
