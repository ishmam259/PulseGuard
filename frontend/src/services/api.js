// ═══════════════════════════════════════════════════════════
// PulseGuard AI — Frontend API Service
// Wraps all backend API calls with JWT auth
// ═══════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

export async function aiChat(message, language = 'en') {
  const res = await apiFetch('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  })
  return res.ok ? await res.json() : { response: 'AI service unavailable', offline: true }
}

export async function aiPredict(vitals) {
  const res = await apiFetch('/ai/predict', {
    method: 'POST',
    body: JSON.stringify(vitals),
  })
  return res.ok ? await res.json() : null
}

export async function aiSummary(patientId) {
  const res = await apiFetch('/ai/summary', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId }),
  })
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
