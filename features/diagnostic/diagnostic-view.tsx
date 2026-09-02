'use client'

import { useState } from 'react'
import { ArrowUp, Check, ChevronRight, ClipboardList, MessageCircle, Sparkles } from 'lucide-react'
import type { DiagnosticStep } from '@/features/diagnostic/diagnostic.types'

const diagnosticSteps = ['Empresa', 'Preguntas', 'Revisión', 'Resultado']

export function DiagnosticView() {
  const [step, setStep] = useState<DiagnosticStep>(1)
  const goBack = () => setStep((currentStep) => Math.max(1, currentStep - 1) as DiagnosticStep)

  return (
    <section className="diagnostic-view page-pad">
      <div className="view-heading">
        <p className="eyebrow">Diagnóstico guiado</p>
        <h1>Conoce el estado de tu empresa</h1>
        <p>Responde unas preguntas y recibe una primera orientación sobre tus prioridades.</p>
      </div>
      <div className="stepper" aria-label="Progreso del diagnóstico">
        {diagnosticSteps.map((label, index) => {
          const stepNumber = index + 1
          const isCurrent = stepNumber === step

          return (
            <div className={stepNumber <= step ? 'step active' : 'step'} key={label} aria-current={isCurrent ? 'step' : undefined}>
              <span>{stepNumber < step ? <Check size={14} /> : stepNumber}</span>
              <small>{label}</small>
            </div>
          )
        })}
      </div>
      {step > 1 && (
        <button className="secondary-button diagnostic-back" onClick={goBack}>
          Atrás
        </button>
      )}
      <div className="diagnostic-card">
        {step === 1 && (
          <>
            <span className="large-card-icon"><ClipboardList size={25} /></span>
            <h2>Empecemos por lo básico</h2>
            <p>Cuéntanos un poco sobre tu empresa para personalizar el diagnóstico.</p>
            <fieldset className="diagnostic-fieldset">
              <legend>¿Cuántas personas trabajan en tu empresa?</legend>
              <div className="choice-grid">
                {['1 – 9', '10 – 49', '50 – 249', '250 o más'].map((choice) => (
                  <button type="button" key={choice} onClick={() => setStep(2)}>{choice}</button>
                ))}
              </div>
            </fieldset>
          </>
        )}
        {step === 2 && (
          <>
            <span className="large-card-icon"><MessageCircle size={25} /></span>
            <h2>Una pregunta importante</h2>
            <p>¿Tienes un plan de prevención de riesgos actualizado?</p>
            <div className="choice-stack">
              <button onClick={() => setStep(3)}>Sí, está actualizado <Check size={17} /></button>
              <button onClick={() => setStep(3)}>No estoy seguro <ChevronRight size={17} /></button>
              <button onClick={() => setStep(3)}>No lo tenemos <ChevronRight size={17} /></button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <span className="large-card-icon"><Check size={25} /></span>
            <h2>Revisa tus respuestas</h2>
            <p>Ya tenemos suficiente información para preparar una orientación inicial.</p>
            <button className="primary-button wide" onClick={() => setStep(4)}>
              Ver resultado <ArrowUp size={17} />
            </button>
          </>
        )}
        {step === 4 && (
          <>
            <span className="result-badge">Prioridad media</span>
            <h2>Tu siguiente paso</h2>
            <p>Te recomendamos revisar y actualizar tu plan de prevención, dejando constancia de la evaluación y de las medidas aplicadas.</p>
            <div className="result-tip">
              <Sparkles size={17} />
              <span>Consulta a NormIA si necesitas ayuda para preparar la documentación.</span>
            </div>
            <button className="secondary-button" onClick={() => setStep(1)}>Repetir diagnóstico</button>
          </>
        )}
      </div>
    </section>
  )
}
