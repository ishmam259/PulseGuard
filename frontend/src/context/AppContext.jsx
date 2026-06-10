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

  const loginWithGoogle = useCallback(async (credential, role) => {
    const result = await api.googleSignIn(credential, role)
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
          title: `SOS Alert: ${data.patient_name}`,
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

  // Periodic actual network/server accessibility check
  useEffect(() => {
    let active = true
    const checkApi = async () => {
      const isOnline = await api.checkHealth()
      if (active) {
        setConnectivity(isOnline ? 'online' : 'offline')
      }
    }

    checkApi()
    const interval = setInterval(checkApi, 2000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pg_locale', locale)
  }, [locale])

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pg_theme') || 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (theme !== 'system') {
      root.classList.add(theme)
      localStorage.setItem('pg_theme', theme)
    } else {
      localStorage.removeItem('pg_theme')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'system') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        return isSystemDark ? 'light' : 'dark'
      }
      return prev === 'dark' ? 'light' : 'dark'
    })
  }, [])

  const toggleConnectivity = useCallback(() => {
    // No-op: manual toggle removed. Status reflects real network state only.
  }, [])

  const value = {
    connectivity,
    toggleConnectivity,
    currentUser,
    setCurrentUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    notifications,
    addNotification,
    locale,
    setLocale,
    theme,
    toggleTheme,
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
