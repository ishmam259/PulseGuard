import $ from '../config/strings'
import { Home, MessageCircle, Users, HeartPulse, BellRing, Droplets, User, Sparkles, CalendarHeart, GraduationCap, Pill, Salad, ShoppingBag } from 'lucide-react'

export const patientNavItems = (locale) => [
  { label: $('NAV_P_HOME', locale),      to: '/patient/dashboard',      icon: '', Icon: Home },
  { label: $('NAV_P_AICHAT', locale),    to: '/patient/ai-chat',        icon: '', Icon: MessageCircle },
  { label: $('NAV_P_COMMUNITY', locale), to: '/patient/community-chat', icon: '', Icon: Users },
  { label: $('NAV_P_CALENDAR', locale),  to: '/patient/calendar',       icon: '', Icon: CalendarHeart },
  { label: $('NAV_P_HEALTH', locale),    to: '/patient/daily-check',    icon: '', Icon: HeartPulse },
  { label: $('NAV_P_ALERTS', locale),    to: '/patient/alerts',         icon: '', Icon: BellRing },
  { label: $('NAV_P_WELLNESS', locale),  to: '/patient/wellness',       icon: '', Icon: Droplets },
  { label: $('NAV_P_NUTRITION', locale), to: '/patient/nutrition',      icon: '', Icon: Salad },
  { label: $('NAV_P_MEDICINE', locale),  to: '/patient/medicine-check', icon: '', Icon: Pill },
  { label: $('NAV_P_EDUCATION', locale), to: '/patient/education',      icon: '', Icon: GraduationCap },
  { label: $('NAV_P_STORE', locale),     to: '/store',                  icon: '', Icon: ShoppingBag },
  { label: $('NAV_P_PROFILE', locale),   to: '/patient/profile',        icon: '', Icon: User },
  { label: $('NAV_P_CONNECT_AI', locale),to: '/patient/connect-ai',     icon: '', Icon: Sparkles },
]

export const workerNavItems = (locale) => [
  { label: $('NAV_W_HOME', locale),     to: '/worker/dashboard',      icon: '', Icon: Home },
  { label: $('NAV_W_PATIENTS', locale), to: '/worker/patients',       icon: '', Icon: Users },
  { label: $('NAV_W_AI', locale),       to: '/worker/ai-analysis',    icon: '', Icon: Sparkles },
  { label: $('NAV_W_MEDICINE', locale), to: '/worker/medicine-verify',icon: '', Icon: Pill },
  { label: $('NAV_W_STORE', locale),    to: '/store',                 icon: '', Icon: ShoppingBag },
  { label: $('NAV_W_PROFILE', locale),  to: '/worker/profile',        icon: '', Icon: User },
]
