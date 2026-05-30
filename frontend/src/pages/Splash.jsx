import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleContext'
import LanguageToggle from '../components/LanguageToggle'

export default function Splash() {
  const { t } = useLocale()
  return (
    <div className="onboarding-container animate-fade-in">
      <div className="onboarding-form-pane">
        <LanguageToggle />
        <div style={{ marginBottom: '2rem' }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
            <img src="/assets/icons/logo-icon.svg" alt={t('ALT_LOGO')} style={{ height: '32px', width: '32px' }} />
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>{t('BRAND_NAME')}</span>
          </div>
          
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem', color: '#FFFFFF' }}>
            {t('SPLASH_HEADING')}
          </h1>
          <p className="muted" style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            {t('SPLASH_DESCRIPTION')}
          </p>
        </div>

        <div className="button-row" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/role" className="btn btn--primary btn--large" style={{ textAlign: 'center' }}>
            {t('SPLASH_CTA')}
          </Link>
        </div>

        <p className="muted" style={{ marginTop: '4rem', fontSize: '12px' }} suppressHydrationWarning>
          &copy; {t('SPLASH_COPYRIGHT', { year: new Date().getFullYear() })}
        </p>
      </div>

      <div className="onboarding-image-pane">
        <img src="/assets/images/onboarding-img.png" alt={t('ALT_ONBOARDING_IMAGE')} />
      </div>
    </div>
  )
}
