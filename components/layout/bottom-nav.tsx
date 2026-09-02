import Link from 'next/link'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'

type BottomNavProps = {
  active: AppRouteId
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {navigationRoutes.map(({ id, shortLabel, href, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          className={active === id ? 'nav-item active' : 'nav-item'}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={19} />
          <span>{shortLabel}</span>
        </Link>
      ))}
    </nav>
  )
}
