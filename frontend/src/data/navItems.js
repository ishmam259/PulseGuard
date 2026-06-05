import $ from '../config/strings'
import { Home, MessageCircle, Users, HeartPulse, BellRing, Droplets, User, LayoutDashboard, Sparkles, RefreshCw } from 'lucide-react'

export const patientNavItems = (locale) => [
  { label: $('NAV_P_HOME', locale),      to: '/patient/dashboard',      icon: '', Icon: Home },
  { label: $('NAV_P_AICHAT', locale),    to: '/patient/ai-chat',        icon: '', Icon: MessageCircle },
  { label: $('NAV_P_COMMUNITY', locale), to: '/patient/community-chat', icon: '', Icon: Users },
  { label: $('NAV_P_HEALTH', locale),    to: '/patient/daily-check',    icon: '', Icon: HeartPulse },
  { label: $('NAV_P_ALERTS', locale),    to: '/patient/alerts',         icon: '', Icon: BellRing },
  { label: $('NAV_P_WELLNESS', locale),  to: '/patient/wellness',       icon: '', Icon: Droplets },
  { label: $('NAV_P_PROFILE', locale),   to: '/patient/profile',        icon: '', Icon: User },
]

export const workerNavItems = (locale) => [
  { label: $('NAV_W_HOME', locale),     to: '/worker/dashboard',   icon: '', Icon: LayoutDashboard },
  { label: $('NAV_W_PATIENTS', locale), to: '/worker/patients',    icon: '', Icon: Users },
  { label: $('NAV_W_AI', locale),       to: '/worker/ai-analysis', icon: '', Icon: Sparkles },
  { label: $('NAV_W_SYNC', locale),     to: '/worker/sync',        icon: '', Icon: RefreshCw },
  { label: $('NAV_W_PROFILE', locale),  to: '/worker/profile',     icon: '', Icon: User },
]
