// Shared helpers for pregnancy-related date handling.
// These were extracted from PregnancyCalendar.jsx so that the
// PregnancyCalendar page and the Education page can format and
// interpret LMP dates in exactly the same way.

export const MS_PER_DAY = 86400000
export const TOTAL_DAYS = 280 // 40 weeks
export const MIN_WEEK = 1
export const MAX_WEEK = 42

// Parse an ISO date string (or anything Date() can parse) into a Date.
// Returns null when the input is missing or invalid.
export function toDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isFinite(d.getTime()) ? d : null
}

// Format a Date as "Mon DD, YYYY" (e.g., "Jun 09, 2026").
// Returns "—" for null/invalid input.
export function fmtDate(d) {
  if (!d) return '—'
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format a Date as ISO date-only "YYYY-MM-DD".
// Returns '' for null/invalid input.
export function isoDate(d) {
  if (!d) return ''
  return d.toISOString().slice(0, 10)
}

// Format a date input (ISO string or Date) as "Mon DD, YYYY".
// Convenience wrapper that accepts either form so callers don't have
// to call toDate() first.
export function fmtLmpDate(input) {
  return fmtDate(toDate(input))
}

// Compute live gestational week and day-of-week (1..7) from an LMP date.
// `nowMs` is injected so the calculation is pure (no Date.now() calls).
// Returns null when no LMP is available.
export function computeAge(lmpIso, nowMs) {
  const lmp = toDate(lmpIso)
  if (!lmp) return null
  const ms = nowMs - lmp.getTime()
  if (ms < 0) return { week: MIN_WEEK, day: 1, isFuture: true }
  const totalDays = Math.floor(ms / MS_PER_DAY)
  const week = Math.max(
    MIN_WEEK,
    Math.min(MAX_WEEK, Math.floor(totalDays / 7) + 1)
  )
  const day = Math.min(7, (totalDays % 7) + 1)
  return { week, day, isFuture: false }
}
