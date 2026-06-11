import { useApp } from '../../context/AppContext'
import { HeroGeometric } from '@/components/ui/shape-landing-hero'

export default function AboutSmoothHero() {
  const { theme } = useApp()

  const colorScheme =
    theme === 'light'
      ? 'light'
      : theme === 'dark'
      ? 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

  return (
    <HeroGeometric
      badge="About PulseGuard"
      title1="Intelligent care,"
      title2="for every mother."
      description="PulseGuard brings AI-powered maternity health monitoring to every Bangladeshi family — at home in Dhaka, at a district clinic, or living abroad. Clinical-grade risk detection, voice-powered health guidance, and personalized AI — all in your language."
      ctaText="Our story"
      ctaHref="#mission"
      colorScheme={colorScheme}
    />
  )
}
