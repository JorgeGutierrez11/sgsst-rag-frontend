import Link from 'next/link'
import { Bot } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { navigationRoutes, type AppRouteId } from '@/shared/navigation.routes'

type SidebarProps = {
  active: AppRouteId
}

export function Sidebar({ active }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark small />
        <strong>Norm<span>IA</span></strong>
      </div>
      <nav>
        {navigationRoutes.map(({ id, label, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            className={active === id ? 'side-link active' : 'side-link'}
            aria-current={active === id ? 'page' : undefined}
          >
            <Icon size={17} /> {label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="mini-note">
          <Bot size={16} />
          <span>Tu asistente de confianza</span>
        </div>
      </div>
    </aside>
  )
}
