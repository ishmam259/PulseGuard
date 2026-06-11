/**
 * Lightweight iPhone-style device frame. Bezel + Dynamic Island are built
 * from CSS (no image asset); the screenshot is passed via `src`. Decorative.
 */
export default function IPhoneMock({ src, alt = '' }) {
  return (
    <div className="iphone-mock">
      <span className="iphone-island" aria-hidden="true" />
      <div className="iphone-screen">
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      </div>
    </div>
  )
}
