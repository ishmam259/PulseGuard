import { useState, useRef, useEffect, useCallback } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'
import { Users } from 'lucide-react'

const POLL_MS = 2000
const TYPING_DEBOUNCE_MS = 1500
const TYPING_STOP_MS = 5000

function displayName(userId) {
  if (!userId) return 'User'
  // Conduit user ids look like "@patient_<uuid>:localhost".
  // We don't have display names yet, so derive a friendly short id.
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
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimerRef = useRef(null)
  const typingStopRef = useRef(null)
  const isTypingRef = useRef(false)
  // Conduit's `end` token is the anchor for both `dir=b` and `dir=f`
  // pagination. After every messages query, we advance this so the
  // next live poll (`dir=f&from=<end>`) returns only newer events.
  const lastEndRef = useRef(null)
  const inputDebounceRef = useRef(null)

  // Build a display-name helper that uses the current user's own id.
  const selfConduitId = currentUser ? `patient_${currentUser.id}` : null
  const isSelf = useCallback((sender) => !!selfConduitId && sender === selfConduitId, [selfConduitId])

  // Initial connect
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const session = await api.getChatSession()
        if (!session) throw new Error('No session')
        const login = await api.loginChat()
        if (!login.ok) throw new Error(login.body?.error || 'Login failed')
        const join = await api.joinChatRoom()
        if (!join.ok) throw new Error(join.body?.error || 'Join failed')
        // dir=b returns the most-recent N messages in REVERSE-chronological
        // order from Conduit. We reverse to ascending for stable display
        // and use the returned `end` token as the live-poll cursor
        // (Conduit's `from` for `dir=f` is the previous page's `end`).
        const first = await api.getChatMessages(null, { dir: 'b', limit: 30 })
        if (cancelled) return
        if (first.ok) {
          const ascending = [...(first.messages || [])].reverse()
          setMessages(ascending)
          lastEndRef.current = first.end || null
          setConnected(true)
        } else {
          setError(first.error?.error || $('COMMUNITY_ERR_LOAD', locale))
        }
      } catch (err) {
        if (!cancelled) setError(err.message || $('COMMUNITY_ERR_LOAD', locale))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    bootstrap()
    return () => { cancelled = true }
  }, [locale])

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, typing])

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

  const onInputChange = (e) => {
    const v = e.target.value
    setInput(v)
    if (!v) {
      // user cleared the box — tell server
      if (isTypingRef.current) {
        isTypingRef.current = false
        api.setChatTyping(false)
        if (typingStopRef.current) { clearTimeout(typingStopRef.current); typingStopRef.current = null }
        if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null }
      }
      return
    }
    if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current)
    inputDebounceRef.current = setTimeout(() => {
      if (!isTypingRef.current) {
        isTypingRef.current = true
        api.setChatTyping(true)
      }
    }, TYPING_DEBOUNCE_MS)

    if (typingStopRef.current) clearTimeout(typingStopRef.current)
    typingStopRef.current = setTimeout(() => {
      isTypingRef.current = false
      api.setChatTyping(false)
    }, TYPING_STOP_MS)
  }

  const sendMessage = async (e) => {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    if (isTypingRef.current) {
      isTypingRef.current = false
      api.setChatTyping(false)
      if (typingStopRef.current) { clearTimeout(typingStopRef.current); typingStopRef.current = null }
      if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null }
    }
    setInput('')
    const r = await api.sendChatMessage(text)
    if (r.ok) {
      // Optimistic append. The next live poll will see the same event
      // from Conduit; the de-dup set will keep the list stable. We
      // don't try to advance the cursor here — the server's send
      // response doesn't return a new `end` token, and within ~POLL_MS
      // the poll will advance it naturally.
      setMessages((prev) => {
        if (prev.find((m) => m.id === r.id)) return prev
        const next = [...prev, { id: r.id, sender: selfConduitId, body: text, ts: Date.now() }]
        next.sort((a, b) => (a.ts || 0) - (b.ts || 0))
        return next
      })
    } else {
      setError(r.error?.error || $('COMMUNITY_ERR_SEND', locale))
      setInput(text) // restore so user can retry
    }
    setSending(false)
  }

  // Group consecutive messages from the same sender
  const rendered = []
  let lastSender = null
  for (const m of messages) {
    rendered.push({ ...m, _groupStart: m.sender !== lastSender })
    lastSender = m.sender
  }

  const typingLabel = (() => {
    if (!typing || typing.length === 0) return null
    const names = typing.map(displayName).join(', ')
    if (typing.length === 1) {
      return `${displayName(typing[0])} ${$('COMMUNITY_TYPING', locale)}`
    }
    return `${names} ${$('COMMUNITY_TYPING_MULTI', locale)}`
  })()

  return (
    <MobileLayout
      title={$('PAGE_TITLE_COMMUNITY_CHAT', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: '400px', borderRadius: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid color-mix(in oklab, var(--color-primary) 6%, transparent)', boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.01)', padding: '4rem 2rem', alignItems: 'center', justifyContent: 'center' }}>
            <p className="muted animate-pulse">{$('COMMUNITY_LOADING', locale)}</p>
          </div>
        ) : error ? (
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
      </div>
    </MobileLayout>
  )
}
