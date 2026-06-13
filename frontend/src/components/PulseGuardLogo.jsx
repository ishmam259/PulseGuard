import logoSrc from '../assets/logo.png'

/**
 * Reusable PulseGuard logo component.
 * Renders the mother-and-child logo image at the requested size.
 *
 * @param {number}  size       – width & height in px (default 36)
 * @param {string}  className  – optional extra class
 * @param {object}  style      – optional extra inline styles
 */
export default function PulseGuardLogo({ size = 36, className = '', style = {} }) {
  return (
    <img
      src={logoSrc}
      alt="PulseGuard"
      className={className}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
