import type { RefObject } from 'react'
import {
  Check,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from 'lucide-react'

import { DiagnosticToast } from '@/features/diagnostic/components/diagnostic-toast'
import { QUESTION_MOTION_CSS } from '@/features/diagnostic/constants/diagnostic-motion'
import type {
  DiagnosticAnswer,
  DiagnosticQuestion,
} from '@/features/diagnostic/diagnostic.types'

type DiagnosticQuestionStageProps = {
  question: DiagnosticQuestion
  catalogName: string | null
  textAnswer: string
  clarificationMessage: string | null
  errorMessage: string | null
  toastMessage: string | null
  isSubmitting: boolean
  stageRef: RefObject<HTMLDivElement | null>
  headingRef: RefObject<HTMLHeadingElement | null>
  onTextAnswerChange: (value: string) => void
  onSubmitAnswer: (answer?: DiagnosticAnswer) => Promise<void>
  onRequestConsultationHelp: () => void
  onRestart: () => void
}

function getCompletedRequirementCount(question: DiagnosticQuestion) {
  return Math.max(0, question.requirement_number - 1)
}

function getProgressPercentage(question: DiagnosticQuestion) {
  if (question.total_requirements <= 0) {
    return 0
  }

  return (getCompletedRequirementCount(question) / question.total_requirements) * 100
}

export function DiagnosticQuestionStage({
  question,
  catalogName,
  textAnswer,
  clarificationMessage,
  errorMessage,
  toastMessage,
  isSubmitting,
  stageRef,
  headingRef,
  onTextAnswerChange,
  onSubmitAnswer,
  onRequestConsultationHelp,
  onRestart,
}: DiagnosticQuestionStageProps) {
  const completedRequirementCount = getCompletedRequirementCount(question)

  return (
    <>
      <style>{QUESTION_MOTION_CSS}</style>

      <div ref={stageRef}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-1">
          <p className="m-0 text-sm font-bold text-brand-dark">
            Requisito {question.requirement_number} de {question.total_requirements}
          </p>

          {catalogName && (
            <p className="m-0 min-w-0 text-sm leading-snug text-txt-medium">
              Ámbito: {catalogName}
            </p>
          )}
        </div>

        <div
          role="progressbar"
          aria-label="Progreso del diagnóstico"
          aria-valuemin={0}
          aria-valuemax={question.total_requirements}
          aria-valuenow={completedRequirementCount}
          aria-valuetext={`${completedRequirementCount} de ${question.total_requirements} requisitos respondidos`}
          className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-primary/15"
        >
          <div
            className="h-full rounded-full bg-brand-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${getProgressPercentage(question)}%` }}
          />
        </div>

        <section
          key={question.question_id}
          aria-labelledby="active-question-title"
          className="diagnostic-question-card mt-3 rounded-2xl border border-brand-primary/25 border-l-4 border-l-brand-primary bg-brand-light/45 px-4 py-3.5 sm:px-5"
        >
          <h2
            id="active-question-title"
            ref={headingRef}
            tabIndex={-1}
            className="m-0 rounded text-lg font-bold leading-snug tracking-tight text-balance text-txt-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary sm:text-xl"
          >
            {question.requirement_name}
          </h2>

          <p className="mb-0 mt-1.5 text-base font-medium leading-normal text-txt-bold">
            {question.text}
          </p>

          <button
            type="button"
            onClick={onRequestConsultationHelp}
            disabled={isSubmitting}
            className="mt-2.5 inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-brand-dark transition-colors hover:bg-brand-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary active:bg-brand-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle size={17} aria-hidden="true" />
            No sé cómo responder
          </button>
        </section>
      </div>

      {toastMessage && <DiagnosticToast message={toastMessage} />}

      <div className="mt-4 grid gap-2.5 px-1 sm:px-1.5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitAnswer(true)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-borde-light bg-capa-main px-4 py-2.5 text-base font-bold text-txt-bold transition hover:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={18} aria-hidden="true" />
            Sí
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmitAnswer(false)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-borde-light bg-capa-main px-4 py-2.5 text-base font-bold text-txt-bold transition hover:border-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} aria-hidden="true" />
            No
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-borde-light" />
          <span className="text-sm font-medium text-txt-muted">
            o responde con tus palabras
          </span>
          <span className="h-px flex-1 bg-borde-light" />
        </div>

        <textarea
          value={textAnswer}
          disabled={isSubmitting}
          onChange={(event) => onTextAnswerChange(event.target.value)}
          rows={3}
          placeholder="Escribe tu respuesta aquí..."
          className="w-full resize-none rounded-xl border border-borde-light bg-capa-main px-4 py-3 text-base leading-[1.6] text-txt-medium outline-none transition-colors placeholder:text-txt-subtle focus:border-brand-primary"
        />

        {clarificationMessage && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-[1.55] text-amber-900">
            {clarificationMessage}
          </div>
        )}

        {errorMessage && (
          <p role="alert" className="m-0 text-sm leading-normal text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          disabled={isSubmitting || textAnswer.trim().length === 0}
          onClick={() => onSubmitAnswer()}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-brand-text shadow-button transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
              Procesando respuesta...
            </>
          ) : (
            <>
              Enviar respuesta escrita
              <Send size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={onRestart}
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-txt-muted transition-colors hover:bg-capa-main hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Volver a empezar
        </button>
      </div>
    </>
  )
}
