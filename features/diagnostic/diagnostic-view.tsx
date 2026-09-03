'use client'

import { useState } from 'react'
import { ArrowUp, Check, ChevronRight, ClipboardList, MessageCircle, Sparkles } from 'lucide-react'
import type { DiagnosticStep } from '@/features/diagnostic/diagnostic.types'

const diagnosticSteps = ['Empresa', 'Preguntas', 'Revisión', 'Resultado']
const choiceButtonClassName = 'flex items-center justify-between rounded-xl border border-borde-light bg-capa-main p-3 text-left text-[13px] text-txt-medium transition-[color,background-color,border-color,transform] hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-dark active:translate-y-0'
const secondaryButtonClassName = 'rounded-full border border-borde-light bg-capa-surface px-4 py-3 text-xs text-txt-medium transition-[color,background-color,border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-borde-gray hover:shadow-soft active:translate-y-0'

export function DiagnosticView() {
  const [step, setStep] = useState<DiagnosticStep>(1)
  const goBack = () => setStep((currentStep) => Math.max(1, currentStep - 1) as DiagnosticStep)

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-var(--bottom-nav-height)-env(safe-area-inset-bottom))] w-full max-w-205 content-center gap-[clamp(12px,2vh,20px)] px-[clamp(16px,5vw,86px)] py-(--mobile-page-y) md:min-h-dvh md:py-(--desktop-page-y)">
      <div className="grid gap-1.5">
        <p className="m-0 mb-3 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">
          Diagnóstico guiado
        </p>

        <h1 className="m-0 max-w-125 text-[clamp(1.8rem,5vw,2.5rem)] tracking-tighter text-balance">
          Conoce el estado de tu empresa
        </h1>

        <p className="m-0 max-w-2xl text-sm leading-[1.6] text-txt-muted">
          Responde unas preguntas y recibe una primera orientación sobre tus prioridades.
        </p>
      </div>

      <div
        className="relative flex justify-between before:absolute before:left-[8%] before:right-[8%] before:top-3.75 before:h-px before:bg-borde-light md:before:left-[10%] md:before:right-[10%]"
        aria-label="Progreso del diagnóstico"
      >
        {diagnosticSteps.map((label, index) => {
          const stepNumber = index + 1
          const isCurrent = stepNumber === step

          return (
            <div
              className={
                stepNumber <= step
                  ? 'z-10 grid justify-items-center gap-2 text-xs text-brand-primary'
                  : 'z-10 grid justify-items-center gap-2 text-xs text-txt-subtle'
              }
              key={label}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={
                  stepNumber <= step
                    ? 'grid size-8 place-items-center rounded-full border border-brand-primary bg-brand-primary text-brand-text'
                    : 'grid size-8 place-items-center rounded-full border border-borde-light bg-capa-main text-txt-subtle'
                }
              >
                {stepNumber < step ? <Check size={14} /> : stepNumber}
              </span>

              <small className="text-xs">{label}</small>
            </div>
          )
        })}
      </div>

      {step > 1 && (
        <button
          className={`${secondaryButtonClassName} justify-self-start`}
          onClick={goBack}
        >
          Atrás
        </button>
      )}

      <div className="max-h-[min(460px,calc(100dvh-var(--bottom-nav-height)-180px))] max-w-155 overflow-auto rounded-[20px] border border-borde-light bg-capa-surface p-5 md:max-h-[min(520px,100dvh)] md:p-8">
        {step === 1 && (
          <>
            <span className="grid size-11 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
              <ClipboardList size={25} />
            </span>
            <h2 className="mb-2 mt-5 text-[23px] tracking-[-0.04em] text-balance">
              Empecemos por lo básico
            </h2>
            <p className="m-0 mb-6.75 text-[13px] leading-[1.6] text-txt-muted">
              Cuéntanos un poco sobre tu empresa para personalizar el diagnóstico.
            </p>
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-3 font-bold text-txt-medium">
                ¿Cuántas personas trabajan en tu empresa?
              </legend>
              <div className="grid grid-cols-2 gap-2 md:gap-2.5">
                {['1 – 9', '10 – 49', '50 – 249', '250 o más'].map((choice) => (
                  <button
                    type="button"
                    className={choiceButtonClassName}
                    key={choice}
                    onClick={() => setStep(2)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 2 && (
          <>
            <span className="grid size-11 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
              <MessageCircle size={25} />
            </span>
            <h2 className="mb-2 mt-5 text-[23px] tracking-[-0.04em] text-balance">
              Una pregunta importante
            </h2>
            <p className="m-0 mb-6.75 text-[13px] leading-[1.6] text-txt-muted">
              ¿Tienes un plan de prevención de riesgos actualizado?
            </p>
            <div className="grid gap-2.5">
              <button className={choiceButtonClassName} onClick={() => setStep(3)}>
                Sí, está actualizado <Check size={17} />
              </button>
              <button className={choiceButtonClassName} onClick={() => setStep(3)}>
                No estoy seguro <ChevronRight size={17} />
              </button>
              <button className={choiceButtonClassName} onClick={() => setStep(3)}>
                No lo tenemos <ChevronRight size={17} />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <span className="grid size-11 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
              <Check size={25} />
            </span>
            <h2 className="mb-2 mt-5 text-[23px] tracking-[-0.04em] text-balance">
              Revisa tus respuestas
            </h2>
            <p className="m-0 mb-6.75 text-[13px] leading-[1.6] text-txt-muted">
              Ya tenemos suficiente información para preparar una orientación inicial.
            </p>
            <button
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-primary px-5 py-3.5 text-[13px] font-bold text-brand-text shadow-button transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0"
              onClick={() => setStep(4)}
            >
              Ver resultado <ArrowUp className="rotate-45" size={17} />
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <span className="inline-block rounded-full bg-status-warning-light px-3 py-1.75 text-[11px] font-bold text-status-warning-main">
              Prioridad media
            </span>
            <h2 className="mb-2 mt-5 text-[23px] tracking-[-0.04em] text-balance">
              Tu siguiente paso
            </h2>
            <p className="m-0 mb-6.75 text-[13px] leading-[1.6] text-txt-muted">
              Te recomendamos revisar y actualizar tu plan de prevención, dejando constancia
              de la evaluación y de las medidas aplicadas.
            </p>
            <div className="mb-5 flex gap-2.25 rounded-xl bg-brand-light p-3.25 text-xs leading-normal text-brand-dark">
              <Sparkles size={17} />
              <span>
                Consulta a NormIA si necesitas ayuda para preparar la documentación.
              </span>
            </div>
            <button
              className={secondaryButtonClassName}
              onClick={() => setStep(1)}
            >
              Repetir diagnóstico
            </button>
          </>
        )}
      </div>
    </section>
  )
}
