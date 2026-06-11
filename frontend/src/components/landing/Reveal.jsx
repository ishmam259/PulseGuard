import { motion, useReducedMotion } from 'framer-motion'

/**
 * Scroll-triggered fade-up wrapper. Fires once when the element enters view.
 * Honors prefers-reduced-motion (renders content with no transform/opacity shift).
 */
export default function Reveal({ children, delay = 0, y = 28, className, as = 'div', ...rest }) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  if (reduce) {
    const Tag = as
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
