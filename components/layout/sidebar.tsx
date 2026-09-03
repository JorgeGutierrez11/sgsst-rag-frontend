import Link from 'next/link'
import { Bot } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'

type SidebarProps = {
  active: AppRouteId
}

export function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="hidden w-62.5 flex-col border-r border-borde-light bg-capa-surface px-4.5 py-7 md:flex">
      <div className="flex items-center gap-2.25 px-2.5 pb-12 text-[19px] font-bold tracking-[-0.04em] text-txt-bold">
        <BrandMark small />
        <strong>
          Norm<span className="text-brand-primary">IA</span>
        </strong>
      </div>
      <nav className="grid gap-1.75">
        {navigationRoutes.map(({ id, label, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            className={
              active === id
                ? 'flex min-w-0 items-center gap-3 rounded-xl bg-brand-light px-3 py-3 text-left text-[13px] font-bold text-brand-dark transition-colors wrap-anywhere'
                : 'flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] text-txt-muted transition-colors hover:bg-capa-soft hover:text-txt-medium wrap-anywhere'
            }
            aria-current={active === id ? 'page' : undefined}
          >
            <Icon size={17} /> {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <div className="flex items-center gap-2 p-2.5 text-xs text-txt-muted">
          <Bot size={16} />
          <span>Tu asistente de confianza</span>
        </div>
      </div>
    </aside>
  )
}
