import { motion, useReducedMotion } from 'framer-motion'
import { Activity, Heart, Droplet, ShieldCheck, Zap, Sparkles } from 'lucide-react'

/**
 * Hero-right signature visual: a floating "device" showing live-feeling
 * maternal vitals, an animating risk gauge, an ECG waveform, and two
 * bobbing status chips. All values are illustrative — no backend.
 */
export default function VitalsMonitor({ locale = 'en' }) {
  const reduce = useReducedMotion()
  const t = (en, bn) => (locale === 'en' ? en : bn)

  // Gauge geometry — a 240° sweep arc.
  const R = 78
  const CIRC = 2 * Math.PI * R
  const SWEEP = 0.66 // fraction of the circle the track occupies (~240°)
  const trackLen = CIRC * SWEEP
  const riskFrac = 0.28 // "Low" — fills 28% of the track

  const float = reduce ? {} : { y: [-9, 9, -9] }
  const floatT = { duration: 5, repeat: Infinity, ease: 'easeInOut' }

  return (
    <div className="vitals">
      {/* Ambient halo behind the device */}
      <div className="vitals__halo" />

      <motion.div
        className="vitals__device"
        initial={reduce ? false : { opacity: 0, x: 36, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header row */}
        <div className="vitals__head">
          <div className="vitals__patient">
            <span className="vitals__avatar">AK</span>
            <span className="vitals__patient-info">
              <strong>Ayesha K.</strong>
              <em>{t('32 weeks · Visit #4', '৩২ সপ্তাহ · ভিজিট #৪')}</em>
            </span>
          </div>
          <span className="vitals__live">
            <span className="vitals__live-dot" />
            {t('Live', 'লাইভ')}
          </span>
        </div>

        {/* Risk gauge */}
        <div className="vitals__gauge">
          <svg viewBox="0 0 200 200" className="vitals__gauge-svg" aria-hidden="true">
            <circle
              cx="100" cy="100" r={R}
              className="vitals__gauge-track"
              strokeDasharray={`${trackLen} ${CIRC}`}
              strokeDashoffset={0}
              transform="rotate(147 100 100)"
            />
            <motion.circle
              cx="100" cy="100" r={R}
              className="vitals__gauge-fill"
              strokeDasharray={`${trackLen} ${CIRC}`}
              transform="rotate(147 100 100)"
              initial={reduce ? false : { strokeDashoffset: trackLen }}
              whileInView={{ strokeDashoffset: trackLen * (1 - riskFrac) }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="vitals__gauge-center">
            <span className="vitals__gauge-label">{t('Risk score', 'ঝুঁকি স্কোর')}</span>
            <span className="vitals__gauge-value">14</span>
            <span className="vitals__gauge-tag">{t('Low risk', 'নিম্ন ঝুঁকি')}</span>
          </div>
        </div>

        {/* ECG waveform */}
        <div className="vitals__ecg">
          <svg viewBox="0 0 320 56" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M0,28 L36,28 L48,28 L56,10 L64,46 L74,20 L84,28 L130,28 L150,28 L158,8 L166,48 L176,18 L186,28 L240,28 L260,28 L268,12 L276,44 L286,22 L296,28 L320,28"
              fill="none"
              className="vitals__ecg-line"
              initial={reduce ? false : { pathLength: 0, opacity: 0.4 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, delay: 0.5, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        {/* Vital stat tiles */}
        <div className="vitals__stats">
          <div className="vitals__stat">
            <span className="vitals__stat-ic"><Heart strokeWidth={2.25} /></span>
            <span className="vitals__stat-num">82<i>bpm</i></span>
            <span className="vitals__stat-cap">{t('Heart rate', 'হৃদস্পন্দন')}</span>
          </div>
          <div className="vitals__stat">
            <span className="vitals__stat-ic"><Activity strokeWidth={2.25} /></span>
            <span className="vitals__stat-num">118/76</span>
            <span className="vitals__stat-cap">{t('Blood pressure', 'রক্তচাপ')}</span>
          </div>
          <div className="vitals__stat">
            <span className="vitals__stat-ic"><Droplet strokeWidth={2.25} /></span>
            <span className="vitals__stat-num">98<i>%</i></span>
            <span className="vitals__stat-cap">{t('SpO₂', 'অক্সিজেন')}</span>
          </div>
        </div>
      </motion.div>

      {/* Floating chips */}
      <motion.div
        className="vitals__chip vitals__chip--tl"
        animate={float}
        transition={floatT}
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <span className="vitals__chip-ic vitals__chip-ic--ok"><ShieldCheck strokeWidth={2.25} /></span>
        <span>
          <strong>{t('AI triage', 'এআই ত্রিভাজ')}</strong>
          <em>{t('Verified on-device', 'ডিভাইসেই যাচাই')}</em>
        </span>
      </motion.div>

      <motion.div
        className="vitals__chip vitals__chip--br"
        animate={reduce ? {} : { y: [8, -8, 8] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <span className="vitals__chip-ic vitals__chip-ic--ok"><Zap strokeWidth={2.25} /></span>
        <span>
          <strong>{t('Real-time alerts', 'তাৎক্ষণিক সতর্কতা')}</strong>
          <em>{t('Live monitoring', 'লাইভ পর্যবেক্ষণ')}</em>
        </span>
      </motion.div>

      <motion.div
        className="vitals__spark"
        animate={reduce ? {} : { y: [-6, 6, -6], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <Sparkles strokeWidth={2} />
      </motion.div>
    </div>
  )
}
