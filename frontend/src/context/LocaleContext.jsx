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

  const n = useCallback((num) => {
    if (num === null || num === undefined) return ''
    if (locale === 'en') return String(num)
    const valStr = String(num).trim()
    const isPhone = /^\+?[0-9\s\-()]{7,20}$/.test(valStr)
    const hasLetters = /[a-zA-Z]/.test(valStr)
    if (isPhone || hasLetters) return String(num)

    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
    return String(num).replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)])
  }, [locale])

  /**
   * Translation function.
   * @param {string} key - String key from strings.js
   * @param {Object} params - Optional interpolation params
   * @returns {string}
   */
  const t = useCallback((key, params) => {
    if (locale === 'bn' && params && typeof params === 'object') {
      const translatedParams = {}
      const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
      Object.keys(params).forEach((param) => {
        const val = params[param]
        if (typeof val === 'number' || typeof val === 'string') {
          const valStr = String(val).trim()
          const isPhone = /^\+?[0-9\s\-()]{7,20}$/.test(valStr)
          const hasLetters = /[a-zA-Z]/.test(valStr)
          if (isPhone || hasLetters) {
            translatedParams[param] = val
          } else {
            translatedParams[param] = valStr.replace(/[0-9]/g, (digit) => banglaDigits[parseInt(digit)])
          }
        } else {
          translatedParams[param] = val
        }
      })
      return $(key, locale, translatedParams)
    }
    return $(key, locale, params)
  }, [locale])

  const value = {
    locale,
    setLocale,
    toggleLocale,
    t,
    n,
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
