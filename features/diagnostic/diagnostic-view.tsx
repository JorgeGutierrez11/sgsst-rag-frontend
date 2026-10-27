'use client'

import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, RotateCcw, TriangleAlert } from 'lucide-react'
import type { DiagnosticRequirementProgress } from '@/features/diagnostic/diagnostic.types'
import { DiagnosticRequirementsSidebar } from '@/features/diagnostic/components/diagnostic-requirements-sidebar'

import { DiagnosticGuideStage } from '@/features/diagnostic/components/diagnostic-guide-stage'
import { DiagnosticQuestionStage } from '@/features/diagnostic/components/diagnostic-question-stage'
import { DiagnosticRequirementTransition } from '@/features/diagnostic/components/diagnostic-requirement-transition'
import { DiagnosticResultStage } from '@/features/diagnostic/components/diagnostic-result-stage'
import { DiagnosticStartStage } from '@/features/diagnostic/components/diagnostic-start-stage'
import { useDiagnosticSession } from '@/features/diagnostic/hooks/use-diagnostic-session'

function getShellSizeClassName(isGuideStage: boolean, hasRequirementsPanel: boolean) {
  if (isGuideStage) {
    return 'max-w-4xl md:p-6'
  }

  if (hasRequirementsPanel) {
    return 'max-w-6xl md:p-4 xl:p-5'
  }

  return 'max-w-2xl md:p-6 xl:p-7'
}

export function DiagnosticView() {
  const diagnosticSession = useDiagnosticSession()
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false)
  const restartDialogRef = useRef<HTMLDialogElement>(null)
  const [isDownloadConfirmOpen, setIsDownloadConfirmOpen] = useState(false)
  const downloadDialogRef = useRef<HTMLDialogElement>(null)
  const recheckDialogRef = useRef<HTMLDialogElement>(null)
  const [recheckTarget, setRecheckTarget] = useState<DiagnosticRequirementProgress | null>(null)
  const handleRequestRestart = () => setIsRestartModalOpen(true)
  const handleConfirmRestart = () => {
    setIsRestartModalOpen(false)
    diagnosticSession.handleRestartDiagnostic()
  }
  const scrollContainerRef = useRef<HTMLElement>(null)
  const questionStageRef = useRef<HTMLDivElement>(null)
  const questionHeadingRef = useRef<HTMLHeadingElement>(null)
  const questionId = diagnosticSession.currentQuestion?.question_id
  const isBusy = diagnosticSession.isSubmitting ||
    diagnosticSession.isRestartingRequirement ||
    diagnosticSession.isDownloadingReport
  const handleRequestDownload = async () => {
    if (isBusy) return

    if (diagnosticSession.isReportGenerated) {
      await diagnosticSession.handleDownloadReport()
      return
    }

    setIsDownloadConfirmOpen(true)
  }
  const handleConfirmDownload = async () => {
    if (isBusy) return

    setIsDownloadConfirmOpen(false)
    await diagnosticSession.handleDownloadReport()
  }
  const openRecheckDialog = (target: DiagnosticRequirementProgress) => {
    if (!isBusy && !diagnosticSession.isReportGenerated && target.status !== 'pending') {
      setRecheckTarget(target)
    }
  }
  const confirmRecheck = async () => {
    if (!recheckTarget || isBusy) return
    const target = recheckTarget
    setRecheckTarget(null)
    await diagnosticSession.handleRecheckRequirement(target)
  }

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
    const dialog = downloadDialogRef.current
    if (!dialog) return

    if (isDownloadConfirmOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isDownloadConfirmOpen && dialog.open) {
      dialog.close()
    }
  }, [isDownloadConfirmOpen])

  useEffect(() => {
    const dialog = recheckDialogRef.current
    if (!dialog) return

    if (recheckTarget && !dialog.open) {
      dialog.showModal()
    } else if (!recheckTarget && dialog.open) {
      dialog.close()
    }
  }, [recheckTarget])

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
    isQuestionStage || Boolean(diagnosticSession.result),
  )

  return (
    <section
      ref={scrollContainerRef}
      className="mx-auto flex h-full min-h-0 w-full flex-col overflow-y-auto overflow-x-hidden px-[clamp(16px,4vw,56px)] py-(--mobile-page-y) md:py-(--desktop-page-y)"
    >
      <div
        className={`mx-auto my-auto w-full min-w-0 bg-capa-surface md:rounded-card md:border md:border-white/70 md:shadow-panel ${shellSizeClassName}`}
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

        {(isQuestionStage || Boolean(diagnosticSession.result)) && (
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(245px,310px)] xl:gap-5">
            {/* En móvil (flex + order) el progreso va después de la pregunta para no empujarla hacia abajo */}
            <div className="min-w-0 max-md:flex max-md:flex-col">
              <details className="mb-4 rounded-xl border border-borde-light bg-capa-main/60 p-2 max-md:order-last max-md:mt-4 max-md:mb-0 xl:hidden">
                <summary className="cursor-pointer px-2 py-1.5 text-sm font-bold text-brand-dark">
                  Ver requisitos ({diagnosticSession.progress?.completed_requirements ?? 0} de {diagnosticSession.requirements.length})
                </summary>
                <div className="mt-2">
                  <DiagnosticRequirementsSidebar
                    requirements={diagnosticSession.requirements}
                    activeRequirementId={diagnosticSession.currentQuestion?.requirement_id ?? null}
                    disabled={isBusy}
                    readOnly={diagnosticSession.isReportGenerated}
                    onRecheck={openRecheckDialog}
                  />
                </div>
              </details>

              {isQuestionStage && diagnosticSession.currentQuestion && (
                <DiagnosticQuestionStage
                  question={diagnosticSession.currentQuestion}
                  catalogName={diagnosticSession.catalogName}
                  textAnswer={diagnosticSession.textAnswer}
                  clarificationMessage={diagnosticSession.clarificationMessage}
                  errorMessage={diagnosticSession.errorMessage}
                  toastMessage={diagnosticSession.toastMessage}
                  isSubmitting={isBusy}
                  stageRef={questionStageRef}
                  headingRef={questionHeadingRef}
                  onTextAnswerChange={diagnosticSession.handleTextAnswer}
                  onSubmitAnswer={diagnosticSession.handleSubmitAnswer}
                  onRequestConsultationHelp={diagnosticSession.handleRequestConsultationHelp}
                  onRestart={handleRequestRestart}
                />
              )}

              {diagnosticSession.result && (
                <>
                  <DiagnosticResultStage
                    isDownloadingReport={diagnosticSession.isDownloadingReport}
                    reportError={diagnosticSession.reportError}
                    onDownloadReport={handleRequestDownload}
                    onRestart={handleRequestRestart}
                  />
                  {!diagnosticSession.isReportGenerated && (
                    <p className="mt-3 text-sm text-txt-medium">
                      ¿Necesitas corregir una respuesta? Selecciona el requisito en el panel de progreso antes de descargar el PDF.
                    </p>
                  )}
                  {diagnosticSession.errorMessage && (
                    <p role="alert" className="mt-3 text-sm text-red-600">{diagnosticSession.errorMessage}</p>
                  )}
                </>
              )}
            </div>
            <aside className="hidden min-w-0 xl:block" aria-label="Navegación por requisitos">
              <div className="sticky top-2">
                <DiagnosticRequirementsSidebar
                  requirements={diagnosticSession.requirements}
                  activeRequirementId={diagnosticSession.currentQuestion?.requirement_id ?? null}
                  disabled={isBusy}
                  readOnly={diagnosticSession.isReportGenerated}
                  onRecheck={openRecheckDialog}
                />
              </div>
            </aside>
          </div>
        )}

        {diagnosticSession.hasStarted && !isQuestionStage && !diagnosticSession.result && (
          <div role="status" className="flex flex-col items-center gap-3 p-8 text-center text-txt-medium">
            {isBusy && <LoaderCircle size={23} className="animate-spin" aria-hidden="true" />}
            <p>{isBusy ? 'Preparando el resultado del diagnóstico...' : 'No se pudo mostrar el resultado.'}</p>
            {diagnosticSession.errorMessage && (
              <p role="alert" className="text-sm text-red-600">{diagnosticSession.errorMessage}</p>
            )}
            {!isBusy && diagnosticSession.progress?.completed && (
              <button type="button" onClick={diagnosticSession.handleRetryCompletion} className="min-h-11 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-brand-text hover:bg-brand-dark">
                Reintentar resultado
              </button>
            )}
          </div>
        )}
      </div>

      {diagnosticSession.requirementTransition && (
        <DiagnosticRequirementTransition notice={diagnosticSession.requirementTransition} />
      )}

      <dialog
        ref={recheckDialogRef}
        aria-labelledby="recheck-dialog-title"
        aria-describedby="recheck-dialog-description"
        onCancel={() => setRecheckTarget(null)}
        onClose={() => setRecheckTarget(null)}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-borde-light bg-capa-surface p-0 text-txt-medium shadow-2xl backdrop:bg-slate-950/55"
      >
        <div className="p-6 sm:p-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <RotateCcw size={24} className="text-amber-700" aria-hidden="true" />
          </div>
          <h2 id="recheck-dialog-title" className="m-0 text-xl font-bold text-txt-bold">
            ¿Rehacer este requisito?
          </h2>
          <p id="recheck-dialog-description" className="mt-3 text-sm leading-relaxed text-txt-medium">
            {recheckTarget?.requirement_number}. {recheckTarget?.requirement_name}
            <span className="mt-2 block">
              Se eliminarán las respuestas de este requisito y comenzarás desde su primera pregunta. Los demás requisitos conservarán sus respuestas.
            </span>
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" autoFocus onClick={() => setRecheckTarget(null)} className="min-h-11 rounded-full border border-borde-light bg-capa-main px-5 py-2.5 text-sm font-bold text-txt-medium hover:bg-capa-surface focus-visible:outline-2 focus-visible:outline-brand-primary">
              Cancelar
            </button>
            <button type="button" onClick={confirmRecheck} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-brand-text hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-brand-primary">
              <RotateCcw size={16} aria-hidden="true" />
              Sí, rehacer requisito
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={downloadDialogRef}
        aria-labelledby="download-dialog-title"
        aria-describedby="download-dialog-description"
        onCancel={() => setIsDownloadConfirmOpen(false)}
        onClose={() => setIsDownloadConfirmOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-borde-light bg-capa-surface p-0 text-txt-medium shadow-2xl backdrop:bg-slate-950/55"
      >
        <div className="p-6 sm:p-7">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
            <TriangleAlert size={24} className="text-amber-700" aria-hidden="true" />
          </div>
          <h2 id="download-dialog-title" className="m-0 text-xl font-bold text-txt-bold">
            ¿Finalizar y descargar el diagnóstico?
          </h2>
          <p id="download-dialog-description" className="mb-6 mt-3 text-sm leading-relaxed text-txt-medium">
            Al generar el informe en PDF, ya no podrás modificar tus respuestas.
            Revisa los requisitos antes de continuar.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              autoFocus
              onClick={() => setIsDownloadConfirmOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-borde-light bg-capa-main px-5 py-2.5 text-sm font-bold text-txt-medium transition-colors hover:bg-capa-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Seguir revisando
            </button>
            <button
              type="button"
              onClick={handleConfirmDownload}
              disabled={isBusy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-bold text-brand-text transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Descargar PDF y finalizar
            </button>
          </div>
        </div>
      </dialog>

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
