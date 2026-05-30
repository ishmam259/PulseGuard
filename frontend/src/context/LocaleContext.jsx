/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import $ from '../config/strings'

const LocaleContext = createContext(null)

const STORAGE_KEY = 'pulseguard_locale'

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'bn'
    } catch {
      return 'bn'
    }
  })

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // localStorage unavailable — silent fail
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'bn' : 'en')
  }, [locale, setLocale])

  /**
   * Translation function.
   * @param {string} key - String key from strings.js
   * @param {Object} params - Optional interpolation params
   * @returns {string}
   */
  const t = useCallback((key, params) => {
    return $(key, locale, params)
  }, [locale])

  const value = {
    locale,
    setLocale,
    toggleLocale,
    t,
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
