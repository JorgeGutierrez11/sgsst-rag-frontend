import type { LucideIcon } from 'lucide-react'
import { BarChart3, Bot, Home, MessageCircle } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import type { AppView } from '@/shared/navigation.types'

type SidebarProps = {
  active: AppView
  onNavigate: (view: AppView) => void
}

const sidebarItems: { id: AppView; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'consulta', label: 'Consulta normativa', icon: MessageCircle },
  { id: 'diagnostico', label: 'Diagnóstico', icon: BarChart3 },
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandMark small />
        <strong>Norm<span>IA</span></strong>
      </div>
      <nav>
        {sidebarItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={active === id ? 'side-link active' : 'side-link'}
            onClick={() => onNavigate(id)}
            aria-current={active === id ? 'page' : undefined}
          >
            <Icon size={17} /> {label}
          </button>
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
