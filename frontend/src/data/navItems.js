import $ from '../config/strings'

export const patientNavItems = (locale) => [
  { label: $('NAV_P_HOME', locale),      to: '/patient/dashboard',      icon: '' },
  { label: $('NAV_P_CALENDAR', locale),  to: '/patient/calendar',       icon: '' },
  { label: $('NAV_P_AICHAT', locale),    to: '/patient/ai-chat',        icon: '' },
  { label: $('NAV_P_COMMUNITY', locale), to: '/patient/community-chat', icon: '' },
  { label: $('NAV_P_HEALTH', locale),    to: '/patient/daily-check',    icon: '' },
  { label: $('NAV_P_ALERTS', locale),    to: '/patient/alerts',         icon: '' },
  { label: $('NAV_P_WELLNESS', locale),  to: '/patient/wellness',       icon: '' },
  { label: $('NAV_P_EDUCATION', locale), to: '/patient/education',      icon: '' },
  { label: $('NAV_P_PROFILE', locale),   to: '/patient/profile',        icon: '' },
]

export const workerNavItems = (locale) => [
  { label: $('NAV_W_HOME', locale),     to: '/worker/dashboard',   icon: '' },
  { label: $('NAV_W_PATIENTS', locale), to: '/worker/patients',    icon: '' },
  { label: $('NAV_W_AI', locale),       to: '/worker/ai-analysis', icon: '' },
  { label: $('NAV_W_SYNC', locale),     to: '/worker/sync',        icon: '' },
  { label: $('NAV_W_PROFILE', locale),  to: '/worker/profile',     icon: '' },
]
