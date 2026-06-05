import { useState, useRef, useEffect, useCallback } from 'react'
import MobileLayout from '../../components/layout/MobileLayout'
import * as api from '../../services/api'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import { useApp } from '../../context/AppContext'

const POLL_MS = 2000
const TYPING_DEBOUNCE_MS = 1500
const TYPING_STOP_MS = 5000

function shortId(userId) {
  if (!userId) return '?'
  const m = userId.match(/patient_([a-f0-9-]{8})/i) || userId.match(/(.{8})$/)
  return m ? m[1] : userId.slice(0, 8)
}

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
  const [end, setEnd] = useState(null)
  const bottomRef = useRef(null)
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
          setEnd(first.end || null)
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
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
          setEnd(r.end)
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
      <div className="animate-fade-in">
        <div className="card" style={{ padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span aria-hidden="true">🟢</span>
            <strong>{online.length}</strong>
            <span className="muted">{$('COMMUNITY_ONLINE_SUFFIX', locale)}</span>
            {typingLabel && (
              <span className="muted" style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
                {typingLabel}
              </span>
            )}
          </div>
          <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
            {$('COMMUNITY_DISCLAIMER', locale)}
          </p>
        </div>

        {loading ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p className="muted animate-pulse">{$('COMMUNITY_LOADING', locale)}</p>
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-danger)' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        ) : (
          <div className="card chat-card" data-testid="community-chat-thread">
            {rendered.length === 0 ? (
              <p className="muted text-center" style={{ padding: '1.5rem 0' }}>
                {$('COMMUNITY_EMPTY', locale)}
              </p>
            ) : (
              rendered.map((m) => (
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
              ))
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
              disabled={!connected || loading || !!error}
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
      </div>
    </MobileLayout>
  )
}
