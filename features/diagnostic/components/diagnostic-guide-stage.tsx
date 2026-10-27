import {
  ArrowRight,
  Check,
  ClipboardList,
  ExternalLink,
  CircleHelp,
  X,
} from 'lucide-react'

import {
  DIAGNOSTIC_GUIDE_STEPS,
  DIAGNOSTIC_LIMIT_ITEMS,
  DIAGNOSTIC_SCOPE_ITEMS,
} from '@/features/diagnostic/constants/diagnostic-guide-content'
import { GUIDE_CTA_CSS } from '@/features/diagnostic/constants/diagnostic-motion'

type DiagnosticGuideStageProps = {
  onAccept: () => void
  onRequestRiskClassHelp: () => void
}

export function DiagnosticGuideStage({
  onAccept,
  onRequestRiskClassHelp,
}: DiagnosticGuideStageProps) {
  return (
    <>
      <style>{GUIDE_CTA_CSS}</style>

      {/* Un solo contenedor con gap uniforme: sin márgenes sueltos entre bloques */}
      <div className="grid gap-3">
        <header className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-primary text-brand-text">
            <ClipboardList size={22} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <h1 className="m-0 text-[clamp(1.5rem,2.4vw,1.9rem)] font-bold leading-[1.1] tracking-tight text-balance text-txt-bold">
              Así funciona el diagnóstico
            </h1>

            {/* Antes repetía los títulos de las secciones de abajo */}
            <p className="mb-0 mt-1 text-[15px] leading-snug text-txt-medium">
              Lee esto antes de ingresar los datos de tu empresa.
            </p>
          </div>
        </header>

        {/* Pasos: tres tarjetas en una fila. El título "Cómo funciona" queda solo
            para lectores de pantalla; los números ya explican la secuencia. */}
        <section aria-labelledby="guide-how-title">
          <h2 id="guide-how-title" className="sr-only">
            Cómo funciona
          </h2>

          <ol
            role="list"
            className="m-0 grid list-none gap-2.5 p-0 md:grid-cols-3"
          >
            {DIAGNOSTIC_GUIDE_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-brand-primary/25 bg-brand-light/40 px-3.5 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-primary text-xs font-bold text-brand-text"
                  >
                    {index + 1}
                  </span>

                  <strong className="text-[15px] leading-snug text-txt-bold">
                    {step.title}
                  </strong>
                </div>

                <p className="mb-0 mt-1.5 text-sm leading-snug text-txt-medium">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Alcance y límites: dos columnas en md+, alturas equilibradas */}
        <div className="grid gap-2.5 md:grid-cols-2 md:gap-3">
          <section
            aria-labelledby="guide-scope-title"
            className="flex flex-col rounded-xl border border-borde-light bg-capa-main/70 px-3.5 py-3"
          >
            <h2
              id="guide-scope-title"
              className="mb-2 text-base font-bold text-txt-bold"
            >
              Qué evalúa
            </h2>

            <ul role="list" className="m-0 grid list-none gap-1.5 p-0">
              {DIAGNOSTIC_SCOPE_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-sm leading-snug text-txt-medium"
                >
                  <Check
                    className="mt-0.5 shrink-0 text-brand-primary"
                    size={16}
                    aria-hidden="true"
                  />
                  <span>{item.content}</span>
                </li>
              ))}
            </ul>

            {/* mt-auto: el enlace ocupa el espacio que sobra frente a la otra
                columna, en vez de dejar un hueco en blanco */}
            <a
              href="https://www.fondoriesgoslaborales.gov.co/sin-categoria/conozca-la-resolucion-0312-de-2019/"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-auto inline-flex items-center gap-1.5 self-start pt-2 text-sm font-bold text-brand-primary underline decoration-brand-primary/40 decoration-2 underline-offset-4 transition-colors hover:text-brand-dark hover:decoration-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Consultar fuente oficial
              <ExternalLink
                size={14}
                aria-hidden="true"
                className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </section>

          <section
            aria-labelledby="guide-limits-title"
            className="rounded-xl border border-borde-light bg-capa-main/70 px-3.5 py-3"
          >
            <h2
              id="guide-limits-title"
              className="mb-1.5 text-base font-bold text-txt-bold"
            >
              Qué debes tener en cuenta
            </h2>

            <p className="m-0 mb-2 text-sm leading-snug text-txt-medium">
              El resultado es{' '}
              <strong className="text-txt-bold">orientativo</strong> y se basa
              en lo que tú declaras. Este diagnóstico no es:
            </p>

            <ul role="list" className="m-0 grid list-none gap-1.5 p-0">
              {DIAGNOSTIC_LIMIT_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-sm leading-snug text-txt-medium"
                >
                  <X
                    className="mt-0.5 shrink-0 text-txt-muted"
                    size={16}
                    aria-hidden="true"
                  />
                  <span>{item.content}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Aviso + acción principal en una sola fila (lg+). Por debajo de lg el contenedor
            desaparece (contents) para que el botón pegajoso use toda la guía como límite */}
        <div className="max-lg:contents lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-3">
          <div className="flex items-start gap-2.5 rounded-xl border border-brand-primary/25 bg-brand-light/40 px-3.5 py-3">
            <CircleHelp
              className="mt-0.5 shrink-0 text-brand-primary"
              size={20}
              aria-hidden="true"
            />

            <div className="min-w-0">
              <h2 className="m-0 text-sm font-bold text-txt-bold">
                ¿No sabes si tu empresa pertenece al riesgo I?
              </h2>

              <p className="mb-2 mt-1 text-sm leading-snug text-txt-medium">
                Consulta tu clase de riesgo con nuestro asistente normativo antes
                de comenzar. Describe la actividad económica de tu empresa.
              </p>

              <button
                type="button"
                onClick={onRequestRiskClassHelp}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-brand-primary/40 bg-capa-surface px-3 py-2 text-sm font-bold text-brand-primary transition-colors hover:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                Consultar mi clase de riesgo
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Pegajoso: si la pantalla es baja (o es un celular) y hay que hacer
              scroll, el botón principal sigue siempre a la vista. */}
          <div className="sticky bottom-0 z-10 bg-linear-to-t from-capa-surface via-capa-surface to-transparent pb-1 pt-3 max-lg:pb-3 max-md:-bottom-(--mobile-page-y) md:max-lg:-bottom-(--desktop-page-y)">
            <button
              type="button"
              onClick={onAccept}
              className="guide-cta group relative isolate inline-flex min-h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-linear-to-br from-brand-primary to-brand-dark px-8 py-3.5 text-lg font-bold tracking-tight text-brand-text ring-1 ring-inset ring-white/20 shadow-[0_12px_28px_-10px_hsl(var(--glow-primary)/0.6),0_2px_6px_-1px_hsl(var(--glow-primary)/0.35)] transition-[transform,box-shadow,filter] duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_34px_-10px_hsl(var(--glow-primary)/0.7),0_4px_10px_-2px_hsl(var(--glow-primary)/0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary active:translate-y-0 active:scale-[0.98] active:brightness-95 motion-reduce:transition-none lg:w-auto lg:min-w-64"
            >
              <span
                aria-hidden="true"
                className="guide-cta__sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-white/35 to-transparent"
              />
              <span className="relative">Entendido, comenzar</span>
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="relative shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}