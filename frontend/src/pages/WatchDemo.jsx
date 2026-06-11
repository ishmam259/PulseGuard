import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, HeartPulse } from 'lucide-react'
import { useApp } from '../context/AppContext'

const VIDEO_ID = 'yYGGC6r2G-Y'

const ease = [0.22, 1, 0.36, 1]

export default function WatchDemo() {
  const navigate = useNavigate()
  const { locale } = useApp()
  const bn = locale === 'bn'

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 28px',
          borderBottom: '1px solid var(--color-border)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'color-mix(in oklch, var(--color-bg) 85%, transparent)',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '7px 14px',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-text)'
            e.currentTarget.style.borderColor = 'var(--color-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-muted)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <ArrowLeft size={14} />
          {bn ? 'ফিরে যান' : 'Back'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <HeartPulse size={18} style={{ color: 'var(--color-primary)' }} />
          <span style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
          }}>
            PulseGuard
          </span>
        </div>

        <div style={{ width: '80px' }} />
      </motion.nav>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 64px',
        gap: '36px',
      }}>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          style={{ textAlign: 'center', maxWidth: '560px' }}
        >
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '12px',
          }}>
            {bn ? 'প্ল্যাটফর্ম ডেমো' : 'Platform Demo'}
          </p>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: 0,
          }}>
            {bn ? 'PulseGuard কীভাবে কাজ করে দেখুন' : 'See PulseGuard in action'}
          </h1>
          <p style={{
            marginTop: '14px',
            fontSize: '15px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.65,
          }}>
            {bn
              ? 'রোগী থেকে স্বাস্থ্যকর্মী এবং অ্যাডমিন — তিনটি ভূমিকায় পুরো প্ল্যাটফর্ম একটি ভিডিওতে।'
              : 'Patient, health worker, and admin — the full platform across all three roles in one walkthrough.'}
          </p>
        </motion.div>

        {/* Video frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.22 }}
          style={{
            width: '100%',
            maxWidth: '900px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid color-mix(in oklch, var(--color-primary) 30%, transparent)',
            boxShadow: [
              '0 0 0 1px color-mix(in oklch, var(--color-primary) 12%, transparent)',
              '0 8px 32px color-mix(in oklch, var(--color-primary) 16%, transparent)',
              '0 32px 80px color-mix(in oklch, var(--color-bg) 60%, transparent)',
            ].join(', '),
            position: 'relative',
          }}
        >
          {/* 16:9 aspect-ratio wrapper */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
              title={bn ? 'PulseGuard ডেমো ভিডিও' : 'PulseGuard demo video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
            />
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { label: bn ? 'ভূমিকা' : 'Roles', value: '3' },
            { label: bn ? 'AI উপাদান' : 'AI components', value: '7' },
            { label: bn ? 'ক্লিনিকাল মডিউল' : 'Clinical modules', value: '15+' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '13px',
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{value}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease, delay: 0.55 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
            {bn ? 'নিজে চেষ্টা করে দেখুন' : 'Ready to try it yourself?'}
          </p>
          <button
            onClick={() => navigate('/role')}
            style={{
              padding: '12px 28px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.88'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {bn ? 'শুরু করুন →' : 'Get started →'}
          </button>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        style={{
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
        }}
      >
        {bn ? 'বাংলাদেশের মায়েদের জন্য তৈরি ❤️' : 'Built for the mothers of Bangladesh ❤️'}
      </motion.footer>
    </div>
  )
}
