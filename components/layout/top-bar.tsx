import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'

type TopBarProps = {
  title?: string
  onMenu?: () => void
}

export function TopBar({ title = 'ChattyAI', onMenu }: TopBarProps) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-only" aria-label="Abrir menú" onClick={onMenu}>
        <span className="menu-line" />
        <span className="menu-line" />
      </button>
      <Link href="/" className="topbar-title">
        <BrandMark small /> <span>{title}</span>
      </Link>
      <button className="icon-button" aria-label="Configuración">
        <Settings2 size={18} />
      </button>
    </header>
  )
}
