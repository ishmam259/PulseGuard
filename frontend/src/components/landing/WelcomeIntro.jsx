import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { HeartPulse } from 'lucide-react'

/**
 * Full-screen welcome animation shown once per browser session.
 * Logo mark scales/rotates in inside dual rotating rings, the wordmark and
 * tagline fade up, then the whole panel slides up and unmounts.
 */
export default function WelcomeIntro({ locale = 'en' }) {
  const reduce = useReducedMotion()
  const t = (en, bn) => (locale === 'en' ? en : bn)

  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('pg_intro_seen') !== '1'
  })

  useEffect(() => {
    if (!show) return
    sessionStorage.setItem('pg_intro_seen', '1')
    // Reduced motion gets a much shorter, motionless hold.
    const hold = reduce ? 900 : 2400
    const timer = setTimeout(() => setShow(false), hold)
    // Lock scroll while the intro is up.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = prevOverflow
    }
  }, [show, reduce])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="welcome-intro"
          initial={{ opacity: 1 }}
          exit={
            reduce
              ? { opacity: 0, transition: { duration: 0.4 } }
              : { y: '-100%', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }
          }
          aria-hidden="true"
        >
          <div className="welcome-intro__bg" />
          <div className="welcome-intro__glow" />

          <div className="welcome-intro__center">
            <motion.div
              className="welcome-intro__mark-wrap"
              initial={reduce ? false : { scale: 0.8, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {!reduce && (
                <>
                  <motion.span
                    className="welcome-intro__ring welcome-intro__ring--outer"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.span
                    className="welcome-intro__ring welcome-intro__ring--inner"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  />
                </>
              )}
              <span className="welcome-intro__mark">
                <HeartPulse strokeWidth={2.25} />
              </span>
            </motion.div>

            <motion.p
              className="welcome-intro__eyebrow"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              {t('Welcome to', 'স্বাগতম')}
            </motion.p>

            <motion.h1
              className="welcome-intro__word"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
            >
              PulseGuard
            </motion.h1>

            <motion.div
              className="welcome-intro__rule"
              initial={reduce ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />

            <motion.p
              className="welcome-intro__tag"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
            >
              {t('AI-native maternal care, even offline', 'অফলাইনেও এআই-নেটিভ মাতৃসেবা')}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
