import Link from 'next/link'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'

type BottomNavProps = {
  active: AppRouteId
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-4 bottom-[calc(12px+env(safe-area-inset-bottom))] z-40 grid min-h-16 grid-cols-3 rounded-full border border-white/70 bg-capa-surface/95 px-3 py-2 shadow-panel backdrop-blur md:hidden" aria-label="Navegación principal">
      {navigationRoutes.map(({ id, shortLabel, href, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          className={active === id
            ? 'grid min-w-0 justify-items-center gap-1 rounded-full bg-capa-main px-2 py-1 text-xs font-bold text-brand-dark shadow-sm transition-[background-color,color,transform] active:translate-y-0 wrap-anywhere'
            : 'grid min-w-0 justify-items-center gap-1 rounded-full px-2 py-1 text-xs text-txt-muted transition-[background-color,color,transform] hover:-translate-y-0.5 hover:bg-capa-main hover:text-txt-medium active:translate-y-0 wrap-anywhere'}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={19} />
          <span>{shortLabel}</span>
        </Link>
      ))}
    </nav>
  )
}
