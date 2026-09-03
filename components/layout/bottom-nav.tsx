import Link from 'next/link'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'

type BottomNavProps = {
  active: AppRouteId
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid min-h-16.5 grid-cols-3 border-t border-borde-light bg-capa-surface/95 px-5 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 md:hidden" aria-label="Navegación principal">
      {navigationRoutes.map(({ id, shortLabel, href, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          className={active === id
            ? 'grid min-w-0 justify-items-center gap-1 text-xs font-bold text-brand-primary transition-transform active:translate-y-0 wrap-anywhere'
            : 'grid min-w-0 justify-items-center gap-1 text-xs text-txt-muted transition-transform hover:-translate-y-0.5 hover:text-txt-medium active:translate-y-0 wrap-anywhere'}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={19} />
          <span>{shortLabel}</span>
        </Link>
      ))}
    </nav>
  )
}
