import $ from '../config/strings'

export const patientNavItems = (locale) => [
  { label: $('NAV_P_HOME', locale),    to: '/patient/dashboard',   icon: '' },
  { label: $('NAV_P_AICHAT', locale),  to: '/patient/ai-chat',     icon: '' },
  { label: $('NAV_P_HEALTH', locale),  to: '/patient/daily-check', icon: '' },
  { label: $('NAV_P_ALERTS', locale),  to: '/patient/alerts',      icon: '' },
  { label: $('NAV_P_PROFILE', locale), to: '/patient/profile',     icon: '' },
]

export const workerNavItems = (locale) => [
  { label: $('NAV_W_HOME', locale),     to: '/worker/dashboard',   icon: '' },
  { label: $('NAV_W_PATIENTS', locale), to: '/worker/patients',    icon: '' },
  { label: $('NAV_W_AI', locale),       to: '/worker/ai-analysis', icon: '' },
  { label: $('NAV_W_SYNC', locale),     to: '/worker/sync',        icon: '' },
  { label: $('NAV_W_PROFILE', locale),  to: '/worker/profile',     icon: '' },
]
