import { useRef, useEffect } from 'react'
import { motion, useScroll, useMotionValue, useReducedMotion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import story1 from '../../assets/story-1.jpg'
import story2 from '../../assets/story-2.jpg'
import story3 from '../../assets/story-3.jpg'

const CHAPTERS = [
  {
    num: '01',
    title:  { en: 'The\nCrisis',          bn: 'সংকট' },
    accent: { en: 'Crisis',               bn: 'সংকট' },
    sub:    { en: 'A problem hiding in plain sight', bn: 'স্পষ্ট দৃষ্টিতে লুকানো সমস্যা' },
    desc:   {
      en: '9 women die every day in Bangladesh from preventable pregnancy complications. Most are in villages, hours from the nearest doctor, seen only by a community health worker with a paper form and a stethoscope.',
      bn: 'প্রতিদিন বাংলাদেশে ৯ জন নারী প্রতিরোধযোগ্য গর্ভাবস্থার জটিলতায় মারা যান। অধিকাংশই গ্রামে থাকেন, নিকটতম ডাক্তার থেকে ঘণ্টার দূরে।',
    },
    img: story1,
  },
  {
    num: '02',
    title:  { en: 'AI for the\nLast Mile', bn: 'শেষ মাইলের AI' },
    accent: { en: 'Last Mile',             bn: 'শেষ মাইল' },
    sub:    { en: 'Intelligence that works offline', bn: 'অফলাইনে কাজ করা বুদ্ধিমত্তা' },
    desc:   {
      en: 'PulseGuard runs on any Android phone, fully offline. It collects vitals, flags risk in 3 seconds, and syncs every visit when connectivity returns — no specialist required in the loop.',
      bn: 'PulseGuard যেকোনো অ্যান্ড্রয়েড ফোনে চলে, সম্পূর্ণ অফলাইনে। ৩ সেকেন্ডে ঝুঁকি চিহ্নিত করে, সংযোগ ফিরলে সিঙ্ক করে।',
    },
    img: story2,
  },
  {
    num: '03',
    title:  { en: 'Every Mother,\nEverywhere', bn: 'প্রতিটি মা,\nসর্বত্র' },
    accent: { en: 'Everywhere',             bn: 'সর্বত্র' },
    sub:    { en: 'A name is not a number', bn: 'একটি নাম কোনো সংখ্যা নয়' },
    desc:   {
      en: 'Our vision: 10,000 clinics, 1 million mothers monitored. Every name becomes a data point in a system that learns, flags early, and keeps families whole.',
      bn: 'আমাদের লক্ষ্য: ১০,০০০ ক্লিনিক, ১০ লাখ মা পর্যবেক্ষণে। প্রতিটি নাম একটি ডেটা পয়েন্টে পরিণত হয়।',
    },
    img: story3,
  },
]

const TOTAL = CHAPTERS.length

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)) }

// Clamp x to [lo, hi], return 0 if the range is zero
function rangeFrac(x, lo, hi) {
  if (hi <= lo) return x >= hi ? 1 : 0
  return Math.max(0, Math.min(1, (x - lo) / (hi - lo)))
}

// Returns keyframe boundaries [a,b,c,d] all in [0,1] strictly increasing
function safeRange(index, fade = 0.06) {
  const start = index / TOTAL
  const end = (index + 1) / TOTAL
  const a = index === 0 ? 0 : Math.max(0, start - fade)
  const b = index === 0 ? 0.001 : Math.min(0.998, start + fade)
  const c = Math.max(b + 0.001, end - fade)
  const d = Math.min(1.0, end + fade)
  return [a, b, c, d]
}

// JS-driven hook — avoids WAAPI so framer-motion never applies fill:none CSS animations
function useScrollOpacity(scrollYProgress, index, fade = 0.06) {
  const isFirst = index === 0
  const isLast = index === TOTAL - 1
  const opacity = useMotionValue(isFirst ? 1 : 0)
  const y = useMotionValue(0)

  useEffect(() => {
    const [a, b, c, d] = safeRange(index, fade)

    function update(v) {
      let op, yv
      if (v <= a) {
        op = isFirst ? 1 : 0
        yv = isFirst ? 0 : 40
      } else if (v <= b) {
        const t = rangeFrac(v, a, b)
        op = isFirst ? 1 : t
        yv = isFirst ? 0 : lerp(40, 0, t)
      } else if (v <= c) {
        op = 1
        yv = 0
      } else if (v <= d) {
        const t = rangeFrac(v, c, d)
        op = isLast ? 1 : lerp(1, 0, t)
        yv = isLast ? 0 : lerp(0, -40, t)
      } else {
        op = isLast ? 1 : 0
        yv = isLast ? 0 : -40
      }
      opacity.set(op)
      y.set(yv)
    }

    update(scrollYProgress.get())
    return scrollYProgress.on('change', update)
  }, [scrollYProgress, index, fade, isFirst, isLast, opacity, y])

  return { opacity, y }
}

function useScrollScale(scrollYProgress, index) {
  const isFirst = index === 0
  const isLast = index === TOTAL - 1
  const scale = useMotionValue(isFirst ? 1 : 1.08)

  useEffect(() => {
    const [a, b, c, d] = safeRange(index, 0.06)

    function update(v) {
      let s
      if (v <= a) s = isFirst ? 1.0 : 1.08
      else if (v <= b) s = lerp(isFirst ? 1.0 : 1.08, 1.0, rangeFrac(v, a, b))
      else if (v <= c) s = 1.0
      else if (v <= d) s = lerp(1.0, isLast ? 1.0 : 0.96, rangeFrac(v, c, d))
      else s = isLast ? 1.0 : 0.96
      scale.set(s)
    }

    update(scrollYProgress.get())
    return scrollYProgress.on('change', update)
  }, [scrollYProgress, index, isFirst, isLast, scale])

  return scale
}

function useScrollWidth(scrollYProgress, index) {
  const isFirst = index === 0
  const isLast = index === TOTAL - 1
  const width = useMotionValue(isFirst ? 40 : 12)
  const bg = useMotionValue(isFirst ? 'oklch(0.62 0.22 0)' : 'oklch(0.62 0.22 0 / 0.15)')

  useEffect(() => {
    const [a, b, c, d] = safeRange(index, 0.06)

    function update(v) {
      let w, active
      if (v <= a) active = isFirst
      else if (v <= b) active = rangeFrac(v, a, b) > 0.5
      else if (v <= c) active = true
      else if (v <= d) active = isLast ? true : rangeFrac(v, c, d) < 0.5
      else active = isLast

      w = active ? 40 : 12
      width.set(w)
      bg.set(active ? 'oklch(0.62 0.22 0)' : 'oklch(0.62 0.22 0 / 0.15)')
    }

    update(scrollYProgress.get())
    return scrollYProgress.on('change', update)
  }, [scrollYProgress, index, isFirst, isLast, width, bg])

  return { width, bg }
}

function ChapterImage({ chapter, index, scrollYProgress }) {
  const { opacity } = useScrollOpacity(scrollYProgress, index, 0.06)
  const scale = useScrollScale(scrollYProgress, index)

  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0">
      <img
        src={chapter.img}
        alt={chapter.title.en}
        className="w-full h-full object-cover"
        style={{ filter: 'brightness(0.82) saturate(0.88)' }}
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, oklch(0 0 0 / 0.2) 0%, transparent 50%)' }} />
    </motion.div>
  )
}

function ChapterProgressBar({ index, scrollYProgress }) {
  const { width, bg } = useScrollWidth(scrollYProgress, index)
  return <motion.div className="about-story-progress-bar" style={{ width, background: bg }} />
}

function ChapterTextPanel({ chapter, index, scrollYProgress, locale }) {
  const { opacity, y } = useScrollOpacity(scrollYProgress, index, 0.04)

  const titleLines = (locale === 'en' ? chapter.title.en : chapter.title.bn).split('\n')
  const sub  = locale === 'en' ? chapter.sub.en  : chapter.sub.bn
  const desc = locale === 'en' ? chapter.desc.en : chapter.desc.bn

  return (
    <motion.div className="about-chapter-text" style={{ opacity, y, pointerEvents: 'none' }}>
      <div className="about-chapter-num" aria-hidden="true">{chapter.num}</div>
      <h2 className="about-chapter-title">
        {titleLines.map((line, i) => {
          const accent = locale === 'en' ? chapter.accent.en : chapter.accent.bn
          if (line.includes(accent)) {
            const parts = line.split(accent)
            return (
              <span key={i}>
                {parts[0]}<em>{accent}</em>{parts[1]}
                {i < titleLines.length - 1 && <br />}
              </span>
            )
          }
          return <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
        })}
      </h2>
      <p className="about-chapter-sub">{sub}</p>
      <p className="about-chapter-desc">{desc}</p>
    </motion.div>
  )
}

export default function AboutScrollStory() {
  const { locale } = useApp()
  const reduce = useReducedMotion()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section className="about-story">

      {/* Desktop: sticky split-screen */}
      <div ref={containerRef} className="about-story-desktop">
        <div className="about-story-sticky">

          {/* Left: text panel */}
          <div className="about-story-text-panel">
            {CHAPTERS.map((ch, i) => (
              reduce
                ? (i === 0 && (
                  <div key={i} className="about-chapter-text">
                    <h2 className="about-chapter-title"><em>{ch.title.en}</em></h2>
                    <p className="about-chapter-desc">{ch.desc.en}</p>
                  </div>
                ))
                : (
                  <ChapterTextPanel
                    key={i}
                    chapter={ch}
                    index={i}
                    scrollYProgress={scrollYProgress}
                    locale={locale}
                  />
                )
            ))}
            <div className="about-story-progress">
              {CHAPTERS.map((_, i) => (
                reduce
                  ? <div key={i} className="about-story-progress-bar" style={{ width: 40, background: 'var(--color-primary)' }} />
                  : <ChapterProgressBar key={i} index={i} scrollYProgress={scrollYProgress} />
              ))}
            </div>
          </div>

          {/* Right: image panel */}
          <div className="about-story-image-panel">
            {CHAPTERS.map((ch, i) => (
              reduce
                ? (i === 0 && (
                  <div key={i} className="absolute inset-0">
                    <img src={ch.img} alt={ch.title.en} className="w-full h-full object-cover" style={{ filter: 'brightness(0.82) saturate(0.88)' }} />
                  </div>
                ))
                : (
                  <ChapterImage key={i} chapter={ch} index={i} scrollYProgress={scrollYProgress} />
                )
            ))}
            <div className="about-story-caption" aria-hidden="true">
              The Sequence
            </div>
          </div>

        </div>
      </div>

      {/* Mobile: card grid */}
      <div className="about-story-mobile">
        <h2 className="about-story-mobile-heading">
          Our <em>Story</em>
        </h2>
        <div className="about-story-mobile-grid">
          {CHAPTERS.map((ch, i) => (
            <motion.div
              key={i}
              className="about-story-mobile-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="about-story-mobile-img">
                <img src={ch.img} alt={ch.title.en} loading="lazy" decoding="async" />
              </div>
              <div>
                <div className="about-story-mobile-num">{ch.num}</div>
                <h3 className="about-story-mobile-title">
                  {locale === 'en' ? ch.title.en.replace('\n', ' ') : ch.title.bn.replace('\n', ' ')}
                </h3>
                <p className="about-story-mobile-desc">
                  {locale === 'en' ? ch.desc.en : ch.desc.bn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  )
}
