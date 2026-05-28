/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [connectivity, setConnectivity] = useState(navigator.onLine ? 'online' : 'offline')
  const [currentUser, setCurrentUser] = useState(undefined)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

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
  const login = useCallback(async (email, password) => {
    const result = await api.login({ email, password })
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
