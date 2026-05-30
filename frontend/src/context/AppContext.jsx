/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [connectivity, setConnectivity] = useState(navigator.onLine ? 'online' : 'offline')
  const [currentUser, setCurrentUser] = useState(undefined)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('pg_locale') || 'en'
  })

  // Load tokens and check auth on mount
  useEffect(() => {
    const init = async () => {
      api.loadTokens()
      if (api.getToken()) {
        try {
          const user = await api.getMe()
          if (user) setCurrentUser(user)
        } catch {
          api.clearTokens()
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev])
  }, [])

  // Real login
  const login = useCallback(async (email, password, role) => {
    const result = await api.login({ email, password, role })
    if (result.ok) {
      setCurrentUser(result.user)
    }
    return result
  }, [])

  // Manage WebSocket connection for real-time notifications
  useEffect(() => {
    if (!currentUser) return

    const ws = api.connectWebSocket((data) => {
      if (data.type === 'risk_alert') {
        addNotification({
          id: Date.now(),
          type: 'risk',
          title: 'High Risk Alert',
          message: data.message || `Risk score: ${data.risk_score}`,
          time: 'Just now',
          read: false,
        })
      } else if (data.type === 'sos_alert') {
        addNotification({
          id: data.id || Date.now(),
          type: 'emergency',
          title: `🚨 SOS: ${data.patient_name}`,
          message: data.message || 'Emergency SOS dispatched!',
          time: 'Just now',
          read: false,
          latitude: data.latitude,
          longitude: data.longitude,
        })
      }
    })

    return () => {
      if (ws) ws.close()
    }
  }, [currentUser, addNotification])

  // Real register
  const register = useCallback(async (data) => {
    const result = await api.register(data)
    if (result.ok) {
      setCurrentUser(result.user)
    }
    return result
  }, [])

  const logout = useCallback(() => {

    api.clearTokens()
    setCurrentUser(null)
    setNotifications([])
  }, [])

  // Listen for real connectivity changes
  useEffect(() => {
    const handleOnline = () => setConnectivity('online')
    const handleOffline = () => setConnectivity('offline')
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pg_locale', locale)
  }, [locale])

  // Auto-sync background offline records when connection is restored
  const syncOfflineQueue = useCallback(async () => {
    if (!currentUser || connectivity !== 'online') return

    const queueStr = localStorage.getItem('pg_offline_queue:v1')
    if (!queueStr) return

    try {
      const queue = JSON.parse(queueStr)
      if (queue.length === 0) return

      console.log('PulseGuard: Found offline items. Starting background sync...', queue)
      const res = await api.syncBatch(queue)
      
      if (res.ok) {
        localStorage.removeItem('pg_offline_queue:v1')
        console.log('PulseGuard: Offline items synchronized successfully!')
        
        // Add a beautiful in-app success toast notification
        addNotification({
          id: Date.now(),
          type: 'success',
          title: '🔄 Offline Sync Complete',
          message: `${queue.length} offline record(s) synced to server successfully!`,
          time: 'Just now',
          read: false,
        })
      } else {
        console.warn('PulseGuard: Sync batch failed:', res.error || res.message)
      }
    } catch (err) {
      console.error('PulseGuard: Unexpected error during offline sync:', err)
    }
  }, [currentUser, connectivity, addNotification])

  // Automatically trigger sync when coming online or logging in online
  useEffect(() => {
    if (connectivity === 'online' && currentUser) {
      syncOfflineQueue()
    }
  }, [connectivity, currentUser, syncOfflineQueue])

  const value = {
    connectivity,
    currentUser,
    setCurrentUser,
    loading,
    login,
    register,
    logout,
    notifications,
    addNotification,
    locale,
    setLocale,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
