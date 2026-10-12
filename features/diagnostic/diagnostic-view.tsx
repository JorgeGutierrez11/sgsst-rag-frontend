'use client'

import { useEffect, useRef } from 'react'

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
  const scrollContainerRef = useRef<HTMLElement>(null)
  const questionStageRef = useRef<HTMLDivElement>(null)
  const questionHeadingRef = useRef<HTMLHeadingElement>(null)
  const questionId = diagnosticSession.currentQuestion?.question_id

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
          <DiagnosticGuideStage onAccept={diagnosticSession.handleAcceptGuide} />
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
            onRestart={diagnosticSession.handleRestartDiagnostic}
          />
        )}

        {diagnosticSession.result && (
          <DiagnosticResultStage
            isDownloadingReport={diagnosticSession.isDownloadingReport}
            reportError={diagnosticSession.reportError}
            onDownloadReport={diagnosticSession.handleDownloadReport}
            onRestart={diagnosticSession.handleRestartDiagnostic}
          />
        )}
      </div>
    </section>
  )
}
