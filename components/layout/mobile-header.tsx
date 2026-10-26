import { BrandMark } from '@/components/layout/brand-mark'
import { ThemeToggle } from './bottom-theme'

export function MobileHeader() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-borde-light bg-capa-surface px-4 py-2.5 md:hidden">
      <div className="flex items-center gap-2 text-lg font-bold tracking-[-0.04em] text-txt-bold">
        <BrandMark small />
        <strong>
          Norm<span className="text-brand-primary">IA</span>
        </strong>
      </div>

      <ThemeToggle />
    </header>
  )
}
