import type { LucideIcon } from 'lucide-react'
import { BarChart3, Home, MessageCircle } from 'lucide-react'
import type { AppView } from '@/shared/navigation.types'

type BottomNavProps = {
  active: AppView
  onNavigate: (view: AppView) => void
}

const navigationItems: { id: AppView; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'consulta', label: 'Consulta', icon: MessageCircle },
  { id: 'diagnostico', label: 'Diagnóstico', icon: BarChart3 },
]

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {navigationItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={active === id ? 'nav-item active' : 'nav-item'}
          onClick={() => onNavigate(id)}
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
