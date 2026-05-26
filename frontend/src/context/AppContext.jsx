import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [connectivity, setConnectivity] = useState('online')
  const [currentUser, setCurrentUser] = useState(null)
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
      // Connect WebSocket for real-time alerts
      api.connectWebSocket((data) => {
        if (data.type === 'risk_alert') {
          addNotification({
            id: Date.now(),
            type: 'emergency',
            title: 'High Risk Alert',
            message: `Risk score: ${data.risk_score}`,
            time: 'Just now',
            read: false,
          })
        }
      })
    }
    return result
  }, [addNotification])

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
    setConnectivity(navigator.onLine ? 'online' : 'offline')
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const value = {
    connectivity,
    currentUser,
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

export default AppContext
