import { Link } from 'react-router-dom'
import Reveal from '../landing/Reveal'
import { useApp } from '../../context/AppContext'

const STATS = [
  { num: '12,000+', label: { en: 'Patients monitored', bn: 'রোগী পর্যবেক্ষণে' } },
  { num: '3.2 sec', label: { en: 'Average risk assessment time', bn: 'গড় ঝুঁকি মূল্যায়নের সময়' } },
  { num: '94%',     label: { en: 'Offline-capable visits', bn: 'অফলাইনে সম্পন্ন ভিজিট' } },
  { num: '99.1%',   label: { en: 'Uptime in low-connectivity zones', bn: 'দুর্বল সংযোগেও আপটাইম' } },
]

export default function AboutImpact() {
  const { locale } = useApp()
  const t = (en, bn) => locale === 'en' ? en : bn

  return (
    <section className="about-impact">
      <div className="about-impact-inner">

        <Reveal className="about-impact-head">
          <span className="about-impact-eyebrow">{t('Real Impact', 'বাস্তব প্রভাব')}</span>
          <h2 className="about-impact-title">
            {t('Every number is a mother kept safe.', 'প্রতিটি সংখ্যা একজন নিরাপদ মায়ের প্রতিনিধিত্ব করে।')}
          </h2>
        </Reveal>

        <div className="about-impact-grid">
          {STATS.map(({ num, label }, i) => (
            <Reveal key={i} delay={i * 0.08} className="about-impact-stat">
              <span className="about-impact-num">{num}</span>
              <p className="about-impact-label">{locale === 'en' ? label.en : label.bn}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="about-impact-cta" delay={0.2}>
          <p className="about-impact-cta-text">
            {t(
              'PulseGuard is open to health NGOs, district hospitals, and government health programs seeking to reduce maternal mortality at scale.',
              'PulseGuard স্বাস্থ্য এনজিও, জেলা হাসপাতাল, এবং মাতৃমৃত্যু হ্রাসে প্রতিশ্রুতিবদ্ধ সরকারি স্বাস্থ্য কর্মসূচির জন্য উন্মুক্ত।'
            )}
          </p>
          <div className="about-impact-buttons">
            <Link to="/role" className="about-impact-btn about-impact-btn--primary">
              {t('Get started', 'শুরু করুন')}
            </Link>
            <Link to="/" className="about-impact-btn about-impact-btn--ghost">
              {t('Back to home', 'হোমে ফিরুন')}
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
