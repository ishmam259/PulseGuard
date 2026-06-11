import { Lock } from 'lucide-react'

/**
 * Lightweight Safari-style browser frame. Chrome is built from the landing
 * design tokens (no image asset); the screenshot is passed via `src` and
 * rendered inside the window. Decorative only — aria-hidden chrome.
 */
export default function SafariMock({ src, alt = '', url = 'pulseguard.app' }) {
  return (
    <div className="safari-mock">
      <div className="safari-bar" aria-hidden="true">
        <span className="safari-dots">
          <i className="safari-dot safari-dot--r" />
          <i className="safari-dot safari-dot--y" />
          <i className="safari-dot safari-dot--g" />
        </span>
        <span className="safari-url">
          <Lock size={11} strokeWidth={2.4} aria-hidden="true" />
          {url}
        </span>
      </div>
      <div className="safari-screen">
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      </div>
    </div>
  )
}
