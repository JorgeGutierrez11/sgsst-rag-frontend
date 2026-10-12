import {
  ArrowRight,
  Check,
  ClipboardList,
  ExternalLink,
  TriangleAlert,
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
}

export function DiagnosticGuideStage({ onAccept }: DiagnosticGuideStageProps) {
  return (
    <>
      <style>{GUIDE_CTA_CSS}</style>

      <header className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-primary text-brand-text">
          <ClipboardList size={24} aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <h1 className="m-0 text-[clamp(1.75rem,3vw,2.35rem)] font-bold leading-[1.1] tracking-tight text-balance text-txt-bold">
            Así funciona el diagnóstico
          </h1>

          <p className="mb-0 mt-2 max-w-2xl text-base leading-[1.55] text-txt-medium">
            Lee esto antes de ingresar los datos de tu empresa: cómo funciona,
            qué se evalúa y qué límites tiene el resultado.
          </p>
        </div>
      </header>

      <section aria-labelledby="guide-how-title" className="mt-5">
        <h2 id="guide-how-title" className="mb-3 text-lg font-bold text-txt-bold">
          Cómo funciona
        </h2>

        <ol role="list" className="m-0 grid list-none gap-3 p-0 md:grid-cols-3">
          {DIAGNOSTIC_GUIDE_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 rounded-xl border border-brand-primary/25 bg-brand-light/40 p-4 md:grid-cols-1 md:gap-2.5"
            >
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full bg-brand-primary text-sm font-bold text-brand-text"
              >
                {index + 1}
              </span>

              <div>
                <strong className="block text-base leading-snug text-txt-bold">
                  {step.title}
                </strong>
                <p className="mb-0 mt-1 text-[15px] leading-[1.5] text-txt-medium">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-4">
        <section
          aria-labelledby="guide-scope-title"
          className="flex flex-col rounded-xl border border-borde-light bg-capa-main/70 p-4"
        >
          <h2 id="guide-scope-title" className="mb-2.5 text-lg font-bold text-txt-bold">
            Qué evalúa
          </h2>

          <ul role="list" className="m-0 grid list-none gap-2 p-0">
            {DIAGNOSTIC_SCOPE_ITEMS.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2.5 text-[15px] leading-[1.5] text-txt-medium"
              >
                <Check
                  className="mt-0.5 shrink-0 text-brand-primary"
                  size={18}
                  aria-hidden="true"
                />
                <span>{item.content}</span>
              </li>
            ))}
          </ul>

          <a
            href="https://www.fondoriesgoslaborales.gov.co/sin-categoria/conozca-la-resolucion-0312-de-2019/"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-2 text-[15px] font-bold text-brand-primary underline decoration-brand-primary/40 decoration-2 underline-offset-4 transition-colors hover:text-brand-dark hover:decoration-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Consultar fuente oficial
            <ExternalLink
              size={15}
              aria-hidden="true"
              className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </section>

        <section
          aria-labelledby="guide-limits-title"
          className="rounded-xl border border-borde-light bg-capa-main/70 p-4"
        >
          <h2 id="guide-limits-title" className="mb-1.5 text-lg font-bold text-txt-bold">
            Qué debes tener en cuenta
          </h2>

          <p className="m-0 mb-2.5 text-[15px] leading-[1.5] text-txt-medium">
            El resultado es <strong className="text-txt-bold">orientativo</strong> y se
            basa en lo que tú declaras. Este diagnóstico no es:
          </p>

          <ul role="list" className="m-0 grid list-none gap-2 p-0">
            {DIAGNOSTIC_LIMIT_ITEMS.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2.5 text-[15px] leading-[1.5] text-txt-medium"
              >
                <X
                  className="mt-0.5 shrink-0 text-txt-muted"
                  size={18}
                  aria-hidden="true"
                />
                <span>{item.content}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <TriangleAlert
            className="mt-0.5 shrink-0 text-amber-700"
            size={20}
            aria-hidden="true"
          />

          <div>
            <p className="m-0 text-[15px] font-bold text-amber-900">
              Descarga tu informe antes de salir
            </p>

            <p className="mb-0 mt-1 text-[15px] leading-[1.5] text-amber-900">
              Por tu privacidad, no guardamos un historial de diagnósticos. Si
              sales de esta sección, recargas la página o la descarga se
              interrumpe, es posible que tengas que repetir el cuestionario.
            </p>
          </div>
        </div>

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
    </>
  )
}
