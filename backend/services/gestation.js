// ═══════════════════════════════════════════════════════════
// Gestational age helpers
// ───────────────────────────────────────────────────────────
// Pregnancy week is stored as a date anchor (`lmp_date`, the
// obstetric "last menstrual period" reference) rather than a
// frozen integer, so the current week advances automatically
// with real time. When a patient enters their current week W,
// we anchor lmp_date = today − W×7 days. The live week is then
// derived on every read.
// ═══════════════════════════════════════════════════════════

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
const MIN_WEEK = 1
const MAX_WEEK = 42 // post-term ceiling

// Convert an entered week to an anchor (LMP) date string 'YYYY-MM-DD'.
function lmpDateFromWeek(week) {
  if (week == null || Number.isNaN(Number(week))) return null
  const anchor = new Date(Date.now() - Number(week) * MS_PER_WEEK)
  return anchor.toISOString().slice(0, 10)
}

// Compute the live gestational week from a patient row.
// Clamps to [1, 42]; falls back to the stored value when no anchor exists.
function computeGestationalWeek(patient) {
  if (patient?.lmp_date) {
    const weeks = Math.floor((Date.now() - new Date(patient.lmp_date).getTime()) / MS_PER_WEEK)
    return Math.max(MIN_WEEK, Math.min(MAX_WEEK, weeks))
  }
  return patient?.gestational_week ?? null
}

// Return a patient row enriched with three fields:
//   gestational_week      — live computed week (replaces stored value)
//   initial_gestational_week — the week as originally entered
//   lmp_recorded_date     — ISO date string when the week was entered
function enrichPatient(patient) {
  const storedWeek = patient?.gestational_week ?? null
  const currentWeek = computeGestationalWeek(patient)
  let lmp_recorded_date = null
  if (patient?.lmp_date && storedWeek != null) {
    const ms = new Date(patient.lmp_date).getTime() + Number(storedWeek) * MS_PER_WEEK
    lmp_recorded_date = new Date(ms).toISOString().slice(0, 10)
  }
  return { ...patient, gestational_week: currentWeek, initial_gestational_week: storedWeek, lmp_recorded_date }
}

module.exports = { lmpDateFromWeek, computeGestationalWeek, enrichPatient }
