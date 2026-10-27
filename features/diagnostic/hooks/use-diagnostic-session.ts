'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import {
  completeDiagnostic,
  createDiagnostic,
  getDiagnosticReport,
  getDiagnosticState,
  restartDiagnosticRequirement,
  submitDiagnosticAnswer,
} from '@/features/diagnostic/api/diagnostic-api'
import { buildConsultationHelpQuestion } from '@/features/diagnostic/consultation-help-question'
import type { DiagnosticAnswer, DiagnosticRequirementProgress } from '@/features/diagnostic/diagnostic.types'
import { useAgentSessionStore } from '@/shared/stores/agent-consultation.store'
import { useAgentDiagnosticStore } from '@/shared/stores/agent-diagnostic.store'

const ANSWER_TOAST_DURATION_MS = 1200
const REQUIREMENT_TRANSITION_DURATION_MS = 1150
const REDUCED_MOTION_TRANSITION_DURATION_MS = 350

export type RequirementTransitionNotice = {
  kind: 'saved' | 'updated'
  requirementNumber: number
  nextRequirementNumber: number | null
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

export function useDiagnosticSession() {
  const router = useRouter()
  const session = useAgentDiagnosticStore()
  const setConsultationDraft = useAgentSessionStore((state) => state.setInput)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestInFlightRef = useRef(false)
  const recheckingRequirementIdRef = useRef<string | null>(null)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [requirementTransition, setRequirementTransition] = useState<RequirementTransitionNotice | null>(null)

  const clearRequirementTransition = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }
    setRequirementTransition(null)
  }, [])

  useEffect(() => () => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }
  }, [])

  const finishAnswerToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = null
    }

    session.setToastMessage(null)
  }, [session.setToastMessage])

  useEffect(() => finishAnswerToast, [finishAnswerToast])

  const showAnswerToast = useCallback(() => {
    finishAnswerToast()
    session.setToastMessage('Respuesta registrada')
    toastTimeoutRef.current = setTimeout(
      finishAnswerToast,
      ANSWER_TOAST_DURATION_MS,
    )
  }, [finishAnswerToast, session.setToastMessage])

  const showRequirementTransition = (notice: RequirementTransitionNotice) => {
    clearRequirementTransition()
    finishAnswerToast()
    setRequirementTransition(notice)

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    transitionTimeoutRef.current = setTimeout(
      clearRequirementTransition,
      reduceMotion ? REDUCED_MOTION_TRANSITION_DURATION_MS : REQUIREMENT_TRANSITION_DURATION_MS,
    )
  }

  const handleCompanyNameChange = (value: string) => {
    session.setCompanyName(value)
    session.setErrorMessage(null)
  }

  const handleWorkerCountChange = (value: string) => {
    session.setWorkerCount(value)
    session.setErrorMessage(null)
  }

  const handleStartDiagnostic = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const companyName = session.companyName.trim()
    const parsedWorkerCount = Number(session.workerCount)

    if (companyName.length === 0) {
      session.setErrorMessage('Ingresa el nombre de la empresa.')
      return
    }

    if (!Number.isInteger(parsedWorkerCount) || parsedWorkerCount <= 0) {
      session.setErrorMessage(
        'Ingresa un número de trabajadores mayor que cero.',
      )
      return
    }

    session.setErrorMessage(null)
    session.setIsStarting(true)

    try {
      const response = await createDiagnostic({
        company_name: companyName,
        worker_count: parsedWorkerCount,
      })

      session.applyDiagnosticState(response)
      recheckingRequirementIdRef.current = null
      clearRequirementTransition()
      session.setCatalogName(response.catalog_name)
      session.setIsReportGenerated(false)
      session.setTextAnswer('')
      session.setClarificationMessage(null)
      session.setResult(null)
      session.setReportBlob(null)
      session.setReportError(null)
    } catch (error) {
      session.setErrorMessage(
        getErrorMessage(error, 'No fue posible iniciar el diagnóstico.'),
      )
    } finally {
      session.setIsStarting(false)
    }
  }

  const handleTextAnswer = (value: string) => {
    session.setTextAnswer(value)
    session.setClarificationMessage(null)
    session.setErrorMessage(null)
  }

  const handleSubmitAnswer = async (directAnswer?: DiagnosticAnswer) => {
    if (
      !session.diagnosisId ||
      !session.currentQuestion ||
      requestInFlightRef.current ||
      session.isRestartingRequirement
    ) {
      return
    }

    const answeredQuestion = session.currentQuestion
    const normalizedText = session.textAnswer.trim()
    const answer =
      directAnswer ?? (normalizedText.length > 0 ? normalizedText : null)

    if (answer === null) {
      session.setErrorMessage('Escribe una respuesta antes de continuar.')
      return
    }

    session.setErrorMessage(null)
    session.setClarificationMessage(null)
    requestInFlightRef.current = true
    session.setIsSubmitting(true)

    try {
      const response = await submitDiagnosticAnswer(session.diagnosisId, {
        requirement_id: session.currentQuestion.requirement_id,
        question_id: session.currentQuestion.question_id,
        answer,
        revision: session.revision,
      })

      session.applyDiagnosticState(response)

      if (response.interpretation_status === 'needs_clarification') {
        session.setClarificationMessage(
          response.clarification_message ??
          'Necesitamos un poco más de información para interpretar la respuesta.',
        )
        session.setCurrentQuestion(response.next_question)
        return
      }

      const requirementFinished = response.progress.completed || (
        response.next_question !== null &&
        response.next_question.requirement_id !== answeredQuestion.requirement_id
      )

      if (requirementFinished) {
        showRequirementTransition({
          kind: recheckingRequirementIdRef.current === answeredQuestion.requirement_id
            ? 'updated'
            : 'saved',
          requirementNumber: answeredQuestion.requirement_number,
          nextRequirementNumber: response.next_question?.requirement_number ?? null,
        })
        recheckingRequirementIdRef.current = null
      } else {
        showAnswerToast()
      }
      session.setTextAnswer('')

      if (response.progress.completed || response.next_question === null) {
        session.setResult(await completeDiagnostic(session.diagnosisId))
        return
      }
    } catch (error) {
      session.setErrorMessage(
        getErrorMessage(error, 'No fue posible registrar la respuesta.'),
      )
      try {
        const latest = await getDiagnosticState(session.diagnosisId)
        if (latest.revision !== session.revision) {
          session.applyDiagnosticState(latest)
          session.setTextAnswer('')
          session.setClarificationMessage(null)
          if (latest.progress.completed) {
            session.setResult(await completeDiagnostic(session.diagnosisId))
            session.setErrorMessage(null)
          } else {
            session.setErrorMessage(
              'El servidor actualizó el cuestionario. Se muestra la siguiente pregunta pendiente.',
            )
          }
        }
      } catch {
        // Conserva el último estado local si el servidor no responde.
      }
    } finally {
      requestInFlightRef.current = false
      session.setIsSubmitting(false)
    }
  }

  const handleRetryCompletion = async () => {
    if (!session.diagnosisId || !session.progress?.completed || requestInFlightRef.current) {
      return
    }

    requestInFlightRef.current = true
    session.setErrorMessage(null)
    session.setIsSubmitting(true)
    try {
      session.setResult(await completeDiagnostic(session.diagnosisId))
    } catch (error) {
      session.setErrorMessage(
        getErrorMessage(error, 'No fue posible preparar el resultado.'),
      )
    } finally {
      requestInFlightRef.current = false
      session.setIsSubmitting(false)
    }
  }

  const handleRecheckRequirement = async (
    requirement: DiagnosticRequirementProgress,
  ) => {
    if (
      !session.diagnosisId ||
      !session.requirements.some((item) => item.requirement_id === requirement.requirement_id && item.status !== 'pending') ||
      session.isSubmitting ||
      session.isRestartingRequirement ||
      session.isDownloadingReport ||
      session.isReportGenerated ||
      requestInFlightRef.current
    ) {
      return
    }

    requestInFlightRef.current = true
    finishAnswerToast()
    clearRequirementTransition()
    session.setIsRestartingRequirement(true)
    session.setErrorMessage(null)
    try {
      const state = await restartDiagnosticRequirement(
        session.diagnosisId,
        requirement.requirement_id,
        session.revision,
      )
      session.applyDiagnosticState(state)
      recheckingRequirementIdRef.current = requirement.requirement_id
      session.setResult(null)
      session.setReportBlob(null)
      session.setTextAnswer('')
      session.setClarificationMessage(null)
      session.setReportError(null)
    } catch (error) {
      session.setErrorMessage(
        getErrorMessage(error, 'No fue posible rehacer el requisito.'),
      )
      try {
        const current = await getDiagnosticState(session.diagnosisId)
        session.applyDiagnosticState(current)
        if (current.next_question !== null) {
          session.setResult(null)
          session.setTextAnswer('')
          session.setClarificationMessage(null)
        }
      } catch {
        // El estado anterior se conserva si la sesión ya no existe.
      }
    } finally {
      session.setIsRestartingRequirement(false)
      requestInFlightRef.current = false
    }
  }

  const handleRestartDiagnostic = () => {
    finishAnswerToast()
    clearRequirementTransition()
    recheckingRequirementIdRef.current = null
    session.resetSession()
  }

  const handleRequestRiskClassHelp = () => {
    setConsultationDraft(
      [
        'Quiero identificar si mi empresa corresponde a la clase de riesgo I.',
        '',
        'Actividad económica principal: [describe qué hace tu empresa]',
        'Código CIIU: [escríbelo aquí o indica que no lo conoces]',
      ].join('\n'),
    )

    router.push('/consulta')
  }

  const handleRequestConsultationHelp = () => {
    if (!session.currentQuestion) {
      return
    }

    setConsultationDraft(
      buildConsultationHelpQuestion({
        requirementName: session.currentQuestion.requirement_name,
        catalogName: session.catalogName,
        workerCount: session.workerCount,
      }),
    )
    router.push('/consulta')
  }

  const handleDownloadReport = async () => {
    if (!session.diagnosisId) {
      return
    }

    session.setReportError(null)
    session.setIsDownloadingReport(true)

    try {
      const blob =
        session.reportBlob ??
        (await getDiagnosticReport(session.diagnosisId))

      if (!session.reportBlob) {
        session.setReportBlob(blob)
        session.setIsReportGenerated(true)
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = 'diagnostico-sgsst.pdf'

      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      session.setReportError(
        getErrorMessage(error, 'No fue posible descargar el informe.'),
      )
    } finally {
      session.setIsDownloadingReport(false)
    }
  }

  return {
    hasAcceptedGuide: session.hasAcceptedGuide,
    companyName: session.companyName,
    workerCount: session.workerCount,
    catalogName: session.catalogName,
    currentQuestion: session.currentQuestion,
    requirements: session.requirements,
    progress: session.progress,
    revision: session.revision,
    isRestartingRequirement: session.isRestartingRequirement,
    isReportGenerated: session.isReportGenerated,
    textAnswer: session.textAnswer,
    result: session.result,
    clarificationMessage: session.clarificationMessage,
    isStarting: session.isStarting,
    isSubmitting: session.isSubmitting,
    errorMessage: session.errorMessage,
    isDownloadingReport: session.isDownloadingReport,
    reportError: session.reportError,
    toastMessage: session.toastMessage,
    requirementTransition,
    hasStarted: session.diagnosisId !== null,
    handleAcceptGuide: session.acceptGuide,
    handleReturnToGuide: session.returnToGuide,
    handleCompanyNameChange,
    handleWorkerCountChange,
    handleStartDiagnostic,
    handleTextAnswer,
    handleSubmitAnswer,
    handleRecheckRequirement,
    handleRetryCompletion,
    handleRequestConsultationHelp,
    handleDownloadReport,
    handleRestartDiagnostic,
    handleRequestRiskClassHelp,
  }
}
