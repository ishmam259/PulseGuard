import { useLocale } from '../context/LocaleContext'

export default function LanguageToggle({ className = '' }) {
  const { locale, toggleLocale } = useLocale()

  return (
    <button
      className={`language-toggle ${className}`}
      onClick={toggleLocale}
      title={locale === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
      aria-label={locale === 'en' ? 'Switch to Bangla' : 'Switch to English'}
    >
      <span className="language-toggle-icon">🌐</span>
      <span className="language-toggle-label">{locale === 'en' ? 'বাং' : 'EN'}</span>
    </button>
  )
}
