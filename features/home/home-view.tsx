import Link from 'next/link'
import { ArrowUp, Check, ChevronRight, ClipboardList, MessageCircle } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'

export function HomeView() {
  return (
    <section className="mx-auto grid min-h-[calc(100dvh-var(--bottom-nav-height)-env(safe-area-inset-bottom))] w-full max-w-212.5 content-center gap-[clamp(18px,3vh,28px)] px-[clamp(16px,5vw,86px)] py-(--mobile-page-y) md:min-h-dvh md:py-(--desktop-page-y)">
      <div className="mx-auto grid max-w-137.5 justify-items-center gap-[clamp(10px,1.8vh,18px)] text-center max-md:gap-3">
        <BrandMark />

        <p className="m-0 mb-3 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">
          Asistente inteligente para tu empresa
        </p>

        <h1 className="m-0 text-[clamp(2rem,7vw,3rem)] leading-[1.04] tracking-[-0.06em] text-balance max-md:text-[clamp(2rem,9vw,2.35rem)]">
          Hola, soy <span className="text-brand-primary">NormIA</span>
        </h1>

        <p className="mx-auto m-0 max-w-2xl text-[15px] leading-[1.7] text-txt-muted text-pretty max-md:text-[13px]">
          Consulta normativa, entiende tus obligaciones y toma decisiones con más claridad.
        </p>

        <Link
          className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-primary px-5 py-3.5 text-[13px] font-bold text-brand-text shadow-button transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0"
          href="/consulta"
        >
          Empezar a consultar
          <ArrowUp className="rotate-45" size={17} />
        </Link>
      </div>
      <div>
        <div>
          <p className="m-0 mb-3 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">
            Todo en un solo lugar
          </p>
          <h2 className="m-0 text-[23px] tracking-tighter text-balance">
            ¿En qué puedo ayudarte?
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-[clamp(10px,1.6vh,16px)] md:grid-cols-2">
        <Link
          className="flex min-w-0 items-center gap-3 rounded-[17px] border border-borde-light bg-capa-surface p-4 text-left text-txt-medium transition-[color,background-color,border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-borde-gray hover:shadow-soft active:translate-y-0 md:p-5"
          href="/consulta"
        >
          <span className="grid h-10 min-w-10 place-items-center rounded-xl bg-brand-light text-brand-dark">
            <MessageCircle size={21} />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="mb-1 block text-[13px]">
              Consulta normativa
            </strong>
            <small className="block text-xs leading-[1.4] text-txt-muted">
              Pregunta sobre legislación y obligaciones
            </small>
          </span>
          <ChevronRight className="text-txt-subtle" size={18} />
        </Link>
        <Link
          className="flex min-w-0 items-center gap-3 rounded-[17px] border border-borde-light bg-capa-surface p-4 text-left text-txt-medium transition-[color,background-color,border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-borde-gray hover:shadow-soft active:translate-y-0 md:p-5"
          href="/diagnostico"
        >
          <span className="grid h-10 min-w-10 place-items-center rounded-xl bg-capa-muted text-txt-medium">
            <ClipboardList size={21} />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="mb-1 block text-[13px]">
              Diagnóstico guiado
            </strong>
            <small className="block text-xs leading-[1.4] text-txt-muted">
              Evalúa el estado actual de tu empresa
            </small>
          </span>

          <ChevronRight className="text-txt-subtle" size={18} />
        </Link>
      </div>
      <div className="flex items-center justify-center gap-1.75 text-xs text-txt-muted">
        <Check className="text-brand-primary" size={15} />
        Respuestas fundamentadas en fuentes oficiales
      </div>
    </section>
  )
}
