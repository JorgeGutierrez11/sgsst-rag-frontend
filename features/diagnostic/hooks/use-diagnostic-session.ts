'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'

import {
  completeDiagnostic,
  createDiagnostic,
  getDiagnosticReport,
  submitDiagnosticAnswer,
} from '@/features/diagnostic/api/diagnostic-api'
import type { DiagnosticAnswer } from '@/features/diagnostic/diagnostic.types'
import { useAgentDiagnosticStore } from '@/shared/stores/agent-diagnostic.store'

const ANSWER_TOAST_DURATION_MS = 2200

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage
}

export function useDiagnosticSession() {
  const session = useAgentDiagnosticStore()
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastResolveRef = useRef<(() => void) | null>(null)

  const finishAnswerToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = null
    }

    session.setToastMessage(null)
    toastResolveRef.current?.()
    toastResolveRef.current = null
  }, [session.setToastMessage])

  useEffect(() => finishAnswerToast, [finishAnswerToast])

  const showAnswerToast = useCallback(() => {
    finishAnswerToast()
    session.setToastMessage('Respuesta registrada')

    return new Promise<void>((resolve) => {
      toastResolveRef.current = resolve
      toastTimeoutRef.current = setTimeout(
        finishAnswerToast,
        ANSWER_TOAST_DURATION_MS,
      )
    })
  }, [finishAnswerToast, session.setToastMessage])

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

      session.setDiagnosisId(response.diagnosis_id)
      session.setCatalogName(response.catalog_name)
      session.setCurrentQuestion(response.next_question)
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
    if (!session.diagnosisId || !session.currentQuestion) {
      return
    }

    const normalizedText = session.textAnswer.trim()
    const answer =
      directAnswer ?? (normalizedText.length > 0 ? normalizedText : null)

    if (answer === null) {
      session.setErrorMessage('Escribe una respuesta antes de continuar.')
      return
    }

    session.setErrorMessage(null)
    session.setClarificationMessage(null)
    session.setIsSubmitting(true)

    try {
      const response = await submitDiagnosticAnswer(session.diagnosisId, {
        requirement_id: session.currentQuestion.requirement_id,
        question_id: session.currentQuestion.question_id,
        answer,
      })

      await showAnswerToast()

      if (response.interpretation_status === 'needs_clarification') {
        session.setClarificationMessage(
          response.clarification_message ??
            'Necesitamos un poco más de información para interpretar la respuesta.',
        )
        session.setCurrentQuestion(response.next_question)
        return
      }

      session.setTextAnswer('')

      if (response.progress.completed || response.next_question === null) {
        session.setCurrentQuestion(null)
        session.setResult(await completeDiagnostic(session.diagnosisId))
        return
      }

      session.setCurrentQuestion(response.next_question)
    } catch (error) {
      session.setErrorMessage(
        getErrorMessage(error, 'No fue posible registrar la respuesta.'),
      )
    } finally {
      session.setIsSubmitting(false)
    }
  }

  const handleRestartDiagnostic = () => {
    if (session.currentQuestion) {
      const confirmed = window.confirm(
        'Se eliminará el progreso de este diagnóstico. ¿Quieres volver a empezar?',
      )

      if (!confirmed) {
        return
      }
    }

    finishAnswerToast()
    session.resetSession()
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
    companyName: session.companyName,
    workerCount: session.workerCount,
    catalogName: session.catalogName,
    currentQuestion: session.currentQuestion,
    textAnswer: session.textAnswer,
    result: session.result,
    clarificationMessage: session.clarificationMessage,
    isStarting: session.isStarting,
    isSubmitting: session.isSubmitting,
    errorMessage: session.errorMessage,
    isDownloadingReport: session.isDownloadingReport,
    reportError: session.reportError,
    toastMessage: session.toastMessage,
    hasStarted: session.diagnosisId !== null,
    handleCompanyNameChange,
    handleWorkerCountChange,
    handleStartDiagnostic,
    handleTextAnswer,
    handleSubmitAnswer,
    handleDownloadReport,
    handleRestartDiagnostic,
  }
}
