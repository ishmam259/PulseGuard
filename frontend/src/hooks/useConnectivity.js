import { useState, useEffect, useCallback } from 'react'

export function useConnectivity() {
  const [status, setStatus] = useState('online') // online | offline | syncing
  const [lastSync, setLastSync] = useState('Just now')

  useEffect(() => {
    const handleOnline = () => setStatus('online')
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (!navigator.onLine) {
      setStatus('offline')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const simulateToggle = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'online') return 'offline'
      if (prev === 'offline') return 'syncing'
      return 'online'
    })
    setLastSync('Just now')
  }, [])

  return { status, lastSync, simulateToggle, setStatus }
}
