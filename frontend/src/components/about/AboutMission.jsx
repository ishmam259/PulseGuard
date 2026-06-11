import Reveal from '../landing/Reveal'
import { useApp } from '../../context/AppContext'

export default function AboutMission() {
  const { locale } = useApp()
  const t = (en, bn) => locale === 'en' ? en : bn

  return (
    <section id="mission" className="about-mission">
      <div className="about-mission-inner">

        {/* Left: sticky editorial heading */}
        <div className="about-mission-left">
          <Reveal>
            <div className="about-mission-head">
              <div className="about-wm" aria-hidden="true">WHY</div>
              <h2 className="about-mission-title">
                {t('We built this because —', 'আমরা এটি তৈরি করেছি কারণ —')}<br />
                <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {t('mothers were dying.', 'মায়েরা মারা যাচ্ছিলেন।')}
                </span>
              </h2>
              <div className="about-accent-rule" />
              <p className="about-mission-body">
                {t(
                  'In rural Bangladesh, a pregnant woman faces a 1-in-31 chance of life-threatening complications — with no specialist in reach. PulseGuard was built to change that, putting AI-powered triage directly in the hands of the health workers already in the field.',
                  'গ্রামীণ বাংলাদেশে, একজন গর্ভবতী নারী জীবন-বিপদজনক জটিলতার ১ ইন ৩১ ঝুঁকিতে থাকেন — কাছে কোনো বিশেষজ্ঞ নেই। PulseGuard তৈরি হয়েছিল এটি পরিবর্তন করতে — ইতিমধ্যে মাঠে থাকা স্বাস্থ্যকর্মীদের হাতে AI-চালিত ত্রিভাজ পৌঁছে দিয়ে।'
                )}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right: stat cards */}
        <div className="about-mission-right">
          <Reveal delay={0.12}>
            <div className="about-stat-card">
              <span className="about-stat-num">1 in 31</span>
              <p className="about-stat-label">
                {t(
                  'women in South Asia face life-threatening pregnancy complications without access to skilled care',
                  'দক্ষিণ এশিয়ার নারীরা দক্ষ সেবা ছাড়াই জীবন-বিপদজনক গর্ভাবস্থার জটিলতায় পড়েন'
                )}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="about-stat-card">
              <span className="about-stat-num">72%</span>
              <p className="about-stat-label">
                {t(
                  'of maternal deaths occur in rural, low-resource settings — exactly where PulseGuard was designed to work',
                  'মাতৃমৃত্যু গ্রামীণ, সম্পদ-সীমিত পরিবেশে ঘটে — ঠিক যেখানে PulseGuard কাজ করতে ডিজাইন করা হয়েছে'
                )}
              </p>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
