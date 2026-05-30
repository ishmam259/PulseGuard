/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as api from '../services/api'
import { useLocale } from './LocaleContext'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { t } = useLocale()
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
          title: t('NOTIF_HIGH_RISK_TITLE'),
          message: data.message || t('NOTIF_RISK_MESSAGE', { score: data.risk_score }),
          time: t('JUST_NOW'),
          read: false,
        })
      } else if (data.type === 'sos_alert') {
        addNotification({
          id: data.id || Date.now(),
          type: 'emergency',
          title: `${t('NOTIF_SOS_PREFIX')} ${data.patient_name}`,
          message: data.message || t('NOTIF_SOS_MESSAGE'),
          time: t('JUST_NOW'),
          read: false,
          latitude: data.latitude,
          longitude: data.longitude,
        })
      }
    })

    return () => {
      if (ws) ws.close()
    }
  }, [currentUser, addNotification, t])

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
