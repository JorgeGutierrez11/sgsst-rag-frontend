import Link from 'next/link'
import { Bot } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'
import { ThemeToggle } from './bottom-theme'

type SidebarProps = {
  active: AppRouteId
}

export function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="relative hidden w-69 overflow-hidden rounded-panel border border-white/70 bg-capa-surface p-4 shadow-panel md:flex md:flex-col">
      <div className="relative z-10 flex justify-between items-center px-2.5 pb-12 pt-3 text-[25px] font-bold tracking-[-0.04em] text-txt-bold">
        <div className="flex items-center gap-2">
          <BrandMark small />
          <strong>
            Norm<span className="text-brand-primary">IA</span>
          </strong>
        </div>

        <ThemeToggle />
      </div>
      <nav className="relative z-10 grid gap-2">
        {navigationRoutes.map(({ id, label, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            className={
              active === id
                ? 'flex min-w-0 items-center gap-3 rounded-full bg-capa-main px-3.5 py-3 text-left text-[13px] font-bold text-txt-bold shadow-sm transition-[background-color,color,box-shadow] wrap-anywhere'
                : 'flex min-w-0 items-center gap-3 rounded-full px-3.5 py-3 text-left text-[13px] text-txt-muted transition-[background-color,color] hover:bg-capa-main hover:text-txt-bold wrap-anywhere'
            }
            aria-current={active === id ? 'page' : undefined}
          >
            <Icon size={17} /> {label}
          </Link>
        ))}
      </nav>
      <div className="relative z-10 mt-auto">
        <div className="flex items-center gap-2 rounded-full bg-capa-main px-3 py-2.5 text-xs text-txt-muted shadow-sm">
          <Bot size={16} />
          <span>Tu asistente de confianza</span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_center,hsl(var(--glow-primary)/0.28),transparent_68%)] blur-2xl" aria-hidden="true" />
    </aside>
  )
}
