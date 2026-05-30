import { NavLink } from 'react-router-dom'
import { useLocale } from '../../context/LocaleContext'

export default function BottomNav({ items }) {
  const { t } = useLocale()
  if (!items || items.length === 0) return null

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span>{item.icon}</span>
          <span>{t(item.label)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
