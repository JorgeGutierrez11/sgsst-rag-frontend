import { BrandMark } from '@/components/layout/brand-mark'
import { ThemeToggle } from './bottom-theme'

export function MobileHeader() {
  return (
    // Barra flotante como la navegación inferior, con esquinas menos redondas para acompañar el marco del teléfono
    <header className="mx-4 mt-[calc(12px+env(safe-area-inset-top))] flex shrink-0 items-center justify-between rounded-2xl border border-white/70 bg-capa-surface/95 px-4 py-2 shadow-panel backdrop-blur md:hidden">
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
