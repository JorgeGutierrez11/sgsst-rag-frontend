import Link from 'next/link'
import { BrandMark } from '@/components/layout/brand-mark'

type TopBarProps = {
  title?: string
}

export function TopBar({ title = 'NormIA' }: TopBarProps) {
  return (
    <header className="topbar">
      <Link href="/" className="topbar-title">
        <BrandMark small /> <span>{title}</span>
      </Link>
    </header>
  )
}
