'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'

import { DiagnosticGuideStage } from '@/features/diagnostic/components/diagnostic-guide-stage'
import { DiagnosticQuestionStage } from '@/features/diagnostic/components/diagnostic-question-stage'
import { DiagnosticResultStage } from '@/features/diagnostic/components/diagnostic-result-stage'
import { DiagnosticStartStage } from '@/features/diagnostic/components/diagnostic-start-stage'
import { useDiagnosticSession } from '@/features/diagnostic/hooks/use-diagnostic-session'

function getShellSizeClassName(isGuideStage: boolean, isQuestionStage: boolean) {
  if (isGuideStage) {
    return 'max-w-4xl p-5 sm:p-6'
  }

  if (isQuestionStage) {
    return 'max-w-3xl p-3 sm:p-4'
  }

  return 'max-w-2xl p-5 sm:p-6 xl:p-7'
}

export function DiagnosticView() {
  const diagnosticSession = useDiagnosticSession()
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false)
  const restartDialogRef = useRef<HTMLDialogElement>(null)
  const handleRequestRestart = () => {setIsRestartModalOpen(true)}
  const handleConfirmRestart = () => {setIsRestartModalOpen(false), diagnosticSession.handleRestartDiagnostic()}
  const scrollContainerRef = useRef<HTMLElement>(null)
  const questionStageRef = useRef<HTMLDivElement>(null)
  const questionHeadingRef = useRef<HTMLHeadingElement>(null)
  const questionId = diagnosticSession.currentQuestion?.question_id

  useEffect(() => {
    const dialog = restartDialogRef.current
    if (!dialog) return

    if (isRestartModalOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isRestartModalOpen && dialog.open) {
      dialog.close()
    }
  }, [isRestartModalOpen])

  useEffect(() => {
    if (!questionId) return

    const container = scrollContainerRef.current
    const stage = questionStageRef.current
    if (!container || !stage) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const offset =
      stage.getBoundingClientRect().top -
      container.getBoundingClientRect().top

    if (offset < 0) {
      container.scrollTo({
        top: container.scrollTop + offset - 8,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }

    questionHeadingRef.current?.focus({ preventScroll: true })
  }, [questionId])

  const isGuideStage =
    !diagnosticSession.hasStarted && !diagnosticSession.hasAcceptedGuide
  const isStartStage =
    !diagnosticSession.hasStarted && diagnosticSession.hasAcceptedGuide
  const isQuestionStage =
    diagnosticSession.hasStarted &&
    Boolean(diagnosticSession.currentQuestion) &&
    !diagnosticSession.result
  const shellSizeClassName = getShellSizeClassName(
    isGuideStage,
    isQuestionStage,
  )

  return (
    <section
      ref={scrollContainerRef}
      className="mx-auto flex h-full min-h-0 w-full flex-col overflow-y-auto overflow-x-hidden px-[clamp(16px,4vw,56px)] py-(--mobile-page-y) md:py-(--desktop-page-y)"
    >
      <div
        className={`mx-auto my-auto w-full min-w-0 rounded-card border border-white/70 bg-capa-surface shadow-panel ${shellSizeClassName}`}
      >
        {!isGuideStage && <h1 className="sr-only">Diagnóstico SG-SST</h1>}

        {isGuideStage && (
          <DiagnosticGuideStage
            onAccept={diagnosticSession.handleAcceptGuide}
            onRequestRiskClassHelp={diagnosticSession.handleRequestRiskClassHelp}
          />
        )}

        {isStartStage && (
          <DiagnosticStartStage
            companyName={diagnosticSession.companyName}
            workerCount={diagnosticSession.workerCount}
            errorMessage={diagnosticSession.errorMessage}
            isStarting={diagnosticSession.isStarting}
            onCompanyNameChange={diagnosticSession.handleCompanyNameChange}
            onWorkerCountChange={diagnosticSession.handleWorkerCountChange}
            onSubmit={diagnosticSession.handleStartDiagnostic}
            onBack={diagnosticSession.handleReturnToGuide}
          />
        )}

        {isQuestionStage && diagnosticSession.currentQuestion && (
          <DiagnosticQuestionStage
            question={diagnosticSession.currentQuestion}
            catalogName={diagnosticSession.catalogName}
            textAnswer={diagnosticSession.textAnswer}
            clarificationMessage={diagnosticSession.clarificationMessage}
            errorMessage={diagnosticSession.errorMessage}
            toastMessage={diagnosticSession.toastMessage}
            isSubmitting={diagnosticSession.isSubmitting}
            stageRef={questionStageRef}
            headingRef={questionHeadingRef}
            onTextAnswerChange={diagnosticSession.handleTextAnswer}
            onSubmitAnswer={diagnosticSession.handleSubmitAnswer}
            onRequestConsultationHelp={
              diagnosticSession.handleRequestConsultationHelp
            }
            onRestart={handleRequestRestart}
          />
        )}

        {diagnosticSession.result && (
          <DiagnosticResultStage
            isDownloadingReport={diagnosticSession.isDownloadingReport}
            reportError={diagnosticSession.reportError}
            onDownloadReport={diagnosticSession.handleDownloadReport}
            onRestart={handleRequestRestart}
          />
        )}
      </div>

      <dialog
        ref={restartDialogRef}
        aria-labelledby="restart-dialog-title"
        aria-describedby="restart-dialog-description"
        onCancel={() => setIsRestartModalOpen(false)}
        onClose={() => setIsRestartModalOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-borde-light bg-capa-surface p-0 text-txt-medium shadow-2xl backdrop:bg-slate-950/55"
      >
        <div className="p-6 sm:p-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
            <TriangleAlert
              size={24}
              className="text-red-600"
              aria-hidden="true"
            />
          </div>

          <h2
            id="restart-dialog-title"
            className="m-0 text-xl font-bold text-txt-bold"
          >
            ¿Quieres volver a empezar?
          </h2>

          <p
            id="restart-dialog-description"
            className="mb-6 mt-3 text-sm leading-relaxed text-txt-medium"
          >
            Si reinicias el diagnóstico, perderás las respuestas
            registradas y tendrás que completar nuevamente el
            cuestionario.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              autoFocus
              onClick={() => setIsRestartModalOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-borde-light bg-capa-main px-5 py-2.5 text-sm font-bold text-txt-medium transition-colors hover:bg-capa-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmRestart}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Sí, reiniciar
            </button>
          </div>
        </div>
      </dialog>
    </section>
  )
}
