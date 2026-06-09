// ═══════════════════════════════════════════════════════════
// PulseGuard AI — Frontend API Service
// Wraps all backend API calls with JWT auth
// ═══════════════════════════════════════════════════════════

let base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
if (base && !base.endsWith('/api')) {
  base = base.replace(/\/$/, '') + '/api'
}
const API_BASE = base

let accessToken = null
let refreshToken = null

export function setTokens(access, refresh) {
  accessToken = access
  refreshToken = refresh
  if (access) localStorage.setItem('pg_token', access)
  if (refresh) localStorage.setItem('pg_refresh', refresh)
}

export function loadTokens() {
  accessToken = localStorage.getItem('pg_token')
  refreshToken = localStorage.getItem('pg_refresh')
}

export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('pg_token')
  localStorage.removeItem('pg_refresh')
}

export function getToken() {
  return accessToken
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let response = await fetch(url, { ...options, headers })

  // If token expired, try refresh
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`
      response = await fetch(url, { ...options, headers })
    }
  }

  return response
}

async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      setTokens(data.token, data.refreshToken)
      return true
    }
  } catch {
    // Refresh failed
  }
  clearTokens()
  return false
}

// ── Auth API ──

export async function register(data) {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (res.ok) setTokens(result.token, result.refreshToken)
  return { ok: res.ok, ...result }
}

export async function login(data) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (res.ok) setTokens(result.token, result.refreshToken)
  return { ok: res.ok, ...result }
}

export async function googleSignIn(credential, role) {
  const res = await apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential, role }),
  })
  const result = await res.json()
  if (res.ok) setTokens(result.token, result.refreshToken)
  return { ok: res.ok, ...result }
}

export async function getMe() {
  const res = await apiFetch('/auth/me')
  return res.ok ? (await res.json()).user : null
}

export async function updateProfile(data) {
  const res = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function uploadProfileImage(base64DataUri) {
  const res = await apiFetch('/auth/upload-image', {
    method: 'POST',
    body: JSON.stringify({ image: base64DataUri }),
  })
  return { ok: res.ok, ...(await res.json()) }
}


// ── Patients API ──

export async function getPatients() {
  const res = await apiFetch('/patients')
  return res.ok ? (await res.json()).patients : []
}

export async function getMyPatientProfile() {
  const res = await apiFetch('/patients/my-profile')
  return res.ok ? await res.json() : { patient: null, latestVitals: null }
}

export async function getPatient(id) {
  const res = await apiFetch(`/patients/${id}`)
  return res.ok ? await res.json() : null
}

export async function createPatient(data) {
  const res = await apiFetch('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function updatePatient(id, data) {
  const res = await apiFetch(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}


export async function addVitals(patientId, data) {
  const res = await apiFetch(`/patients/${patientId}/vitals`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function getHistory(patientId) {
  const res = await apiFetch(`/patients/${patientId}/history`)
  return res.ok ? (await res.json()).history : []
}

// ── Sync API ──

export async function syncBatch(items) {
  const res = await apiFetch('/sync', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function getConflicts() {
  const res = await apiFetch('/sync/conflicts')
  return res.ok ? (await res.json()).conflicts : []
}

export async function resolveConflict(id, resolution) {
  const res = await apiFetch(`/sync/conflicts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  })
  return { ok: res.ok, ...(await res.json()) }
}

// ── AI API ──

export async function medicineSearch(q) {
  const res = await apiFetch(`/medicine/search?q=${encodeURIComponent(q)}`)
  return res.ok ? res.json() : { results: [], error: 'unreachable' }
}

export async function medicineCheck(payload) {
  const res = await apiFetch('/medicine/check', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.ok ? res.json() : { error: 'offline', offline: true }
}

export async function medicineSafety(name, pregnancyWeek, language) {
  const res = await apiFetch('/medicine/safety', {
    method: 'POST',
    body: JSON.stringify({ name, pregnancyWeek, language }),
  })
  return res.ok ? res.json() : { error: 'AI unavailable' }
}

export async function aiChat(message, language = 'en') {
  const res = await apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  })
  return res.ok ? await res.json() : { response: 'AI service unavailable', offline: true }
}

export async function getAIChats(q = '') {
  const res = await apiFetch(`/ai/chats?q=${encodeURIComponent(q)}`)
  return res.ok ? (await res.json()).chats : []
}

export async function createAIChat(title) {
  const res = await apiFetch('/ai/chats', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
  return res.ok ? await res.json() : null
}

export async function getAIChat(id) {
  const res = await apiFetch(`/ai/chats/${id}`)
  return res.ok ? await res.json() : null
}

export async function sendAIChatMessage(id, message, language = 'en') {
  const res = await apiFetch(`/ai/chats/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  })
  return res.ok ? await res.json() : { response: 'AI service unavailable', offline: true }
}

export async function deleteAIChat(id) {
  const res = await apiFetch(`/ai/chats/${id}`, {
    method: 'DELETE',
  })
  return res.ok
}

export async function aiPredict(vitals) {
  const res = await apiFetch('/ai/predict', {
    method: 'POST',
    body: JSON.stringify(vitals),
  })
  return res.ok ? await res.json() : null
}

export async function aiSummary(patientId, result, symptoms) {
  const res = await apiFetch('/ai/summary', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId, result: result, symptoms: symptoms }),
  })

  if (!res.ok) {
    // This will print the exact Pydantic validation error to your browser console!
    const errorDetails = await res.json();
    console.error("FastAPI Validation Error:", JSON.stringify(errorDetails, null, 2));
    return null;
  }
  
  return res.ok ? await res.json() : null
}

// ── Alerts API ──

export async function createAlert(data) {
  const res = await apiFetch('/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function getAlerts() {
  const res = await apiFetch('/alerts')
  return res.ok ? (await res.json()).alerts : []
}

export async function resolveAlert(id, status) {
  const res = await apiFetch(`/alerts/${id}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
  return { ok: res.ok, ...(await res.json()) }
}

// ── Emergency Contacts API ──

export async function getEmergencyContacts() {
  const res = await apiFetch('/emergency-contacts')
  return res.ok ? (await res.json()).contacts : []
}

export async function createEmergencyContact(data) {
  const res = await apiFetch('/emergency-contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function updateEmergencyContact(id, data) {
  const res = await apiFetch(`/emergency-contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function deleteEmergencyContact(id) {
  const res = await apiFetch(`/emergency-contacts/${id}`, {
    method: 'DELETE',
  })
  return { ok: res.ok, ...(await res.json()) }
}

// ── Users (Admin) ──

export async function getUsers() {
  const res = await apiFetch('/users')
  return res.ok ? await res.json() : []
}

export async function createUser(data) {
  const res = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function deleteUser(id) {
  const res = await apiFetch(`/users/${id}`, {
    method: 'DELETE',
  })
  return { ok: res.ok, ...(await res.json()) }
}

// ── WebSocket ──

export function connectWebSocket(onMessage) {
  if (!accessToken) return null

  const wsUrl = (API_BASE.replace('http', 'ws').replace('/api', '')) + `/ws?token=${accessToken}`
  const ws = new WebSocket(wsUrl)

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch {
      // Invalid message
    }
  }

  ws.onclose = () => {
    // Reconnect after 5 seconds
    setTimeout(() => connectWebSocket(onMessage), 5000)
  }

  return ws
}

// ── Wellness API ──

export async function logWater(amount_ml) {
  const res = await apiFetch('/wellness/water', { method: 'POST', body: JSON.stringify({ amount_ml }) })
  return { ok: res.ok, ...(await res.json()) }
}

export async function deleteWaterEntry(id) {
  const res = await apiFetch(`/wellness/water/${id}`, { method: 'DELETE' })
  return { ok: res.ok, ...(await res.json()) }
}

export async function logVomit(data) {
  const res = await apiFetch('/wellness/vomit', { method: 'POST', body: JSON.stringify(data) })
  return { ok: res.ok, ...(await res.json()) }
}

export async function deleteVomitEntry(id) {
  const res = await apiFetch(`/wellness/vomit/${id}`, { method: 'DELETE' })
  return { ok: res.ok, ...(await res.json()) }
}

export async function getWellnessDaily() {
  const res = await apiFetch('/wellness/daily')
  return res.ok ? await res.json() : null
}

export async function getWaterWeekTrend() {
  const res = await apiFetch('/wellness/water/week')
  return res.ok ? (await res.json()).trend : []
}

export async function getWellnessSummary(patientId) {
  const res = await apiFetch(`/wellness/summary/${patientId}`)
  return res.ok ? await res.json() : null
}

// ── Nutrition API ──

export async function logNutrition(data) {
  const res = await apiFetch('/nutrition/log', { method: 'POST', body: JSON.stringify(data) })
  return { ok: res.ok, ...(await res.json()) }
}

export async function deleteNutritionEntry(id) {
  const res = await apiFetch(`/nutrition/log/${id}`, { method: 'DELETE' })
  return { ok: res.ok, ...(await res.json()) }
}

export async function getNutritionDaily() {
  const res = await apiFetch('/nutrition/daily')
  return res.ok ? await res.json() : null
}

export async function getNutritionSummary(patientId) {
  const res = await apiFetch(`/nutrition/summary/${patientId}`)
  return res.ok ? await res.json() : null
}

export async function searchNutritionFoods(q, category) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const res = await apiFetch(`/nutrition/foods/search?${params}`)
  return res.ok ? (await res.json()).foods : []
}

export async function getNutritionWeekly() {
  const res = await apiFetch('/nutrition/weekly')
  return res.ok ? await res.json() : null
}

export async function updateNutritionEntry(id, data) {
  const res = await apiFetch(`/nutrition/log/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  return { ok: res.ok, ...(await res.json()) }
}

// ── AI Config API ──

export async function getAIConfig() {
  const res = await apiFetch('/ai-config')
  return res.ok ? (await res.json()).config : null
}

export async function updateAIConfig(data) {
  const res = await apiFetch('/ai-config', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return { ok: res.ok, ...(await res.json()) }
}

export async function checkHealth() {
  // Check REAL internet connectivity by pinging an external endpoint.
  // localhost services are always reachable even when the device has no internet.
  if (!navigator.onLine) return false
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    await fetch('https://www.gstatic.com/generate_204', {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return true
  } catch {
    return false
  }
}

// ── Community Chat API (proxied to Conduit via /api/chat) ──

export async function getChatSession() {
  const res = await apiFetch('/chat/get-chat-token')
  return res.ok ? res.json() : null
}

export async function loginChat() {
  const res = await apiFetch('/chat/login', { method: 'POST' })
  return { ok: res.ok, body: res.ok ? await res.json() : await res.json().catch(() => ({})) }
}

export async function joinChatRoom() {
  const res = await apiFetch('/chat/rooms/join', { method: 'POST' })
  return { ok: res.ok, body: res.ok ? await res.json() : await res.json().catch(() => ({})) }
}

export async function getChatMessages(since = null, { dir = 'b', limit = 30 } = {}) {
  const params = new URLSearchParams({ dir, limit: String(limit) })
  if (since) params.set('from', since)
  const res = await apiFetch(`/chat/messages?${params.toString()}`)
  if (!res.ok) return { ok: false, messages: [], end: null, start: null, error: await res.json().catch(() => ({})) }
  return { ok: true, ...(await res.json()) }
}

export async function sendChatMessage(body) {
  const res = await apiFetch('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
  if (!res.ok) return { ok: false, error: await res.json().catch(() => ({})) }
  return { ok: true, ...(await res.json()) }
}

export async function setChatTyping(typing) {
  const res = await apiFetch('/chat/typing', {
    method: 'POST',
    body: JSON.stringify({ typing }),
  })
  return { ok: res.ok, body: res.ok ? await res.json().catch(() => ({})) : await res.json().catch(() => ({})) }
}

export async function getChatPresence() {
  const res = await apiFetch('/chat/presence')
  if (!res.ok) return { ok: false, online: [], typing: [], error: await res.json().catch(() => ({})) }
  return { ok: true, ...(await res.json()) }
}
