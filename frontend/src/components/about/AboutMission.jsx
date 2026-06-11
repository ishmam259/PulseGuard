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
                  'Across Bangladesh, too many pregnancies still go without timely clinical oversight — in urban hospitals stretched thin, in district clinics hours from a specialist, or for families living abroad with no local support. PulseGuard was built to close that gap, putting AI-powered triage and monitoring in every mother\'s hands.',
                  'বাংলাদেশ জুড়ে, অনেক গর্ভাবস্থাই সময়মতো চিকিৎসা তত্ত্বাবধান ছাড়া চলে — শহরের হাসপাতালে সীমিত সংস্থান, জেলা ক্লিনিকে বিশেষজ্ঞের অভাব, বা বিদেশে থাকা পরিবারের ক্ষেত্রে স্থানীয় সহায়তা নেই। PulseGuard তৈরি হয়েছে এই ব্যবধান ঘুচিয়ে দিতে।'
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
                  'of maternal deaths are preventable with timely monitoring and clinical guidance — precisely what PulseGuard delivers',
                  'মাতৃমৃত্যু সময়মতো পর্যবেক্ষণ ও চিকিৎসা নির্দেশনায় প্রতিরোধযোগ্য — ঠিক এটাই PulseGuard সরবরাহ করে'
                )}
              </p>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
