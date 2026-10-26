import Link from 'next/link'
import { Info, ChevronRight, ClipboardList, MessageCircle } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'

const homeActionCardClassName = 'group flex min-h-30 min-w-0 items-start gap-3 rounded-card border border-white/70 bg-capa-surface p-4 text-left text-txt-medium shadow-soft transition-[color,background-color,border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-panel focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-primary active:translate-y-0 md:p-5'


export function HomeView() {
  return (
    <section className="relative mx-auto grid min-h-full w-full max-w-230 content-center gap-6 px-[clamp(16px,5vw,86px)] py-(--mobile-page-y) md:gap-7 md:py-(--desktop-page-y)">
      {/* Jerarquía: marca -> título -> una sola frase de contexto */}
      <div className="relative isolate mx-auto grid w-full max-w-170 justify-items-center gap-3 text-center md:gap-4">
        {/* El brillo vive dentro del hero: queda detrás del logo y el título,
            y no desborda horizontalmente (w = ancho del hero) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-80 -translate-y-1/2 bg-[radial-gradient(closest-side,hsl(var(--glow-primary)/0.14),transparent)]"
          aria-hidden="true"
        />
        <BrandMark />
        <h1 className="text-balance text-[clamp(2rem,7vw,3.25rem)] leading-[1.1] tracking-tight text-txt-bold">
          La seguridad y salud de tu empresa, <span className="text-brand-primary">más clara</span>
        </h1>
        <p className="mx-auto max-w-150 text-pretty text-base leading-relaxed text-txt-muted">
          <span className="font-semibold text-txt-medium">¿Tienes dudas sobre seguridad y salud en el trabajo?</span> <br />
          <span className="text-brand-primary">NormIA</span> te ayuda a encontrar respuestas, entender las normas y revisar cómo está tu empresa.
        </p>
      </div>

      {/* Acciones. Los verbos reflejan el título (entender / evaluar).
          La tarjeta de consulta es la acción principal (aplica a toda empresa);
          la de evaluación es secundaria porque tiene restricción de alcance. */}
      <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <Link
          className={`${homeActionCardClassName} group ring-1 ring-brand-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
          href="/consulta"
          aria-labelledby="home-consulta-title"
          aria-describedby="home-consulta-desc"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-dark">
            <MessageCircle size={21} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong id="home-consulta-title" className="block text-base text-txt-bold">
              Entender una obligación
            </strong>
            <span id="home-consulta-desc" className="mt-1 block text-sm leading-normal text-txt-muted">
              Pregunta por un requisito del SG-SST y consulta las fuentes de la respuesta.
            </span>
          </span>
          <ChevronRight
            className="shrink-0 self-center text-txt-subtle transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            size={18}
            aria-hidden="true"
          />
        </Link>

        <Link
          className={`${homeActionCardClassName} group ring-1 ring-brand-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
          href="/diagnostico"
          aria-labelledby="home-diagnostico-title"
          aria-describedby="home-diagnostico-desc"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-capa-muted text-txt-medium">
            <ClipboardList size={21} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong id="home-diagnostico-title" className="block text-base text-txt-bold">
              Evaluar mi SG-SST
            </strong>
            <span id="home-diagnostico-desc" className="mt-1 block text-sm leading-normal text-txt-muted">
              Responde una evaluación guiada y recibe un informe orientativo.
            </span>
            <span className="mt-2 inline-block rounded-full bg-capa-muted px-2 py-0.5 text-xs font-semibold text-txt-medium">
              Solo para empresas de riesgo I
            </span>
          </span>
          <ChevronRight
            className="shrink-0 self-center text-txt-subtle transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            size={18}
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* Alcance y límites */}
      <aside
        className="relative flex items-start gap-3 rounded-card border border-brand-primary/20 bg-capa-surface/70 p-4 text-sm leading-relaxed text-txt-muted shadow-xs md:px-5"
        aria-label="Alcance y límites de NormIA"
      >
        <Info className="mt-0.5 shrink-0 text-brand-primary" size={18} aria-hidden="true" />
        <div className="grid gap-1.5">
          <p>
            NormIA es una guía orientativa y no reemplaza la asesoría de un profesional en seguridad y
            salud en el trabajo.
          </p>
          <p>
            Está pensada principalmente para MiPymes. La evaluación solo aplica a empresas de riesgo I; tu
            clase de riesgo figura en tu afiliación a la ARL.
          </p>
        </div>
      </aside>
    </section>
  )
}
