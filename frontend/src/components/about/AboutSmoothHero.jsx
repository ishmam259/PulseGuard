import { motion, useScroll, useTransform, useMotionTemplate, useReducedMotion } from 'framer-motion'
import desktopImg from '../../assets/hero-desktop.jpg'
import mobileImg from '../../assets/hero-mobile.jpg'

const SCROLL_H = 1800

export default function AboutSmoothHero() {
  const { scrollY } = useScroll()
  const reduce = useReducedMotion()

  // Clip-path expand from 20%→0% corners as user scrolls
  const clipStart = useTransform(scrollY, [0, SCROLL_H], [20, 0])
  const clipEnd   = useTransform(scrollY, [0, SCROLL_H], [80, 100])
  const clipPath  = useMotionTemplate`polygon(${clipStart}% ${clipStart}%, ${clipEnd}% ${clipStart}%, ${clipEnd}% ${clipEnd}%, ${clipStart}% ${clipEnd}%)`
  const bgSize    = useTransform(scrollY, [0, SCROLL_H + 500], ['170%', '100%'])

  // Overlay text fades in as clip opens
  const textOpacity = useTransform(scrollY, [0, 300], [0, 1])
  const textY       = useTransform(scrollY, [0, 350], [24, 0])

  return (
    <div style={{ height: `calc(${SCROLL_H}px + 100vh)` }} className="relative w-full">
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ clipPath: reduce ? undefined : clipPath, willChange: 'clip-path' }}
      >
        {/* Mobile background */}
        <motion.div
          className="absolute inset-0 md:hidden"
          style={{
            backgroundImage: `url(${mobileImg})`,
            backgroundSize: reduce ? 'cover' : bgSize,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Desktop background */}
        <motion.div
          className="absolute inset-0 hidden md:block"
          style={{
            backgroundImage: `url(${desktopImg})`,
            backgroundSize: reduce ? 'cover' : bgSize,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Dark gradient overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, oklch(0 0 0 / 0.18) 0%, oklch(0 0 0 / 0.58) 100%)' }}
        />

        {/* Centered text overlay */}
        <motion.div
          className="about-hero-content"
          style={reduce ? {} : { opacity: textOpacity, y: textY }}
        >
          <span className="about-eyebrow">About PulseGuard</span>
          <div className="about-eyebrow-rule" aria-hidden="true" />
          <h1 className="about-hero-title">
            Born in the field.<br />
            <em>Built for the future.</em>
          </h1>
          <p className="about-hero-sub">
            A decision-support tool for trained health workers and mothers in last-mile clinics — AI-powered, offline-first, and designed for the world's most underserved communities.
          </p>
          <a href="#mission" className="about-hero-cta">
            Our story <span aria-hidden="true">↓</span>
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}
