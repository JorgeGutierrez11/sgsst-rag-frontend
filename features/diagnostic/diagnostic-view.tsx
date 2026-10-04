'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Check,
  ClipboardList,
  Download,
  LoaderCircle,
  MessageCircle,
  Send,
  X,
} from 'lucide-react'

import {
  completeDiagnostic,
  createDiagnostic,
  getDiagnosticReport,
  submitDiagnosticAnswer,
} from '@/features/diagnostic/api/diagnostic-api'

import type {
  CompleteDiagnosticResponse,
  DiagnosticQuestion,
} from '@/features/diagnostic/diagnostic.types'

export function DiagnosticView() {
  const [workerCount, setWorkerCount] = useState('')

  const [diagnosisId, setDiagnosisId] =
    useState<string | null>(null)

  const [catalogName, setCatalogName] =
    useState<string | null>(null)

  const [currentQuestion, setCurrentQuestion] =
    useState<DiagnosticQuestion | null>(null)

  const [booleanAnswer, setBooleanAnswer] =
    useState<boolean | null>(null)

  const [textAnswer, setTextAnswer] = useState('')

  const [result, setResult] =
    useState<CompleteDiagnosticResponse | null>(null)

  const [clarificationMessage, setClarificationMessage] =
    useState<string | null>(null)

  const [isStarting, setIsStarting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [reportBlob, setReportBlob] =
    useState<Blob | null>(null)

  const [isDownloadingReport, setIsDownloadingReport] =
    useState(false)

  const [reportError, setReportError] =
    useState<string | null>(null)

  const handleStartDiagnostic = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const parsedWorkerCount = Number(workerCount)

    if (
      !Number.isInteger(parsedWorkerCount) ||
      parsedWorkerCount <= 0
    ) {
      setErrorMessage(
        'Ingresa un número de trabajadores mayor que cero.',
      )
      return
    }

    setErrorMessage(null)
    setIsStarting(true)

    try {
      const response = await createDiagnostic({
        worker_count: parsedWorkerCount,
      })

      setDiagnosisId(response.diagnosis_id)
      setCatalogName(response.catalog_name)
      setCurrentQuestion(response.next_question)

      setBooleanAnswer(null)
      setTextAnswer('')
      setClarificationMessage(null)
      setResult(null)
      setReportBlob(null)
      setReportError(null)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar el diagnóstico.',
      )
    } finally {
      setIsStarting(false)
    }
  }

  const handleBooleanAnswer = (
    value: boolean,
  ) => {
    setBooleanAnswer(value)
    setTextAnswer('')
    setClarificationMessage(null)
    setErrorMessage(null)
  }

  const handleTextAnswer = (
    value: string,
  ) => {
    setTextAnswer(value)
    setBooleanAnswer(null)
    setClarificationMessage(null)
    setErrorMessage(null)
  }

  const resetAnswer = () => {
    setBooleanAnswer(null)
    setTextAnswer('')
  }

  const handleSubmitAnswer = async () => {
    if (!diagnosisId || !currentQuestion) {
      return
    }

    const normalizedText = textAnswer.trim()

    const answer =
      normalizedText.length > 0
        ? normalizedText
        : booleanAnswer

    if (answer === null) {
      setErrorMessage(
        'Selecciona Sí o No, o escribe una respuesta antes de continuar.',
      )
      return
    }

    setErrorMessage(null)
    setClarificationMessage(null)
    setIsSubmitting(true)

    try {
      const response =
        await submitDiagnosticAnswer(
          diagnosisId,
          {
            requirement_id:
              currentQuestion.requirement_id,
            question_id:
              currentQuestion.question_id,
            answer,
          },
        )

      if (
        response.interpretation_status ===
        'needs_clarification'
      ) {
        setClarificationMessage(
          response.clarification_message ??
          'Necesitamos un poco más de información para interpretar la respuesta.',
        )

        setCurrentQuestion(
          response.next_question,
        )

        return
      }

      resetAnswer()

      if (
        response.progress.completed ||
        response.next_question === null
      ) {
        setCurrentQuestion(null)

        const completed =
          await completeDiagnostic(
            diagnosisId,
          )

        setResult(completed)

        return
      }

      setCurrentQuestion(
        response.next_question,
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible registrar la respuesta.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!diagnosisId) {
      return
    }

    setReportError(null)
    setIsDownloadingReport(true)

    try {
      const blob =
        reportBlob ??
        await getDiagnosticReport(
          diagnosisId,
        )

      if (!reportBlob) {
        setReportBlob(blob)
      }

      const url =
        URL.createObjectURL(blob)

      const link =
        document.createElement('a')

      link.href = url
      link.download =
        'diagnostico-sgsst.pdf'

      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      setReportError(
        error instanceof Error
          ? error.message
          : 'No fue posible descargar el informe.',
      )
    } finally {
      setIsDownloadingReport(false)
    }
  }

  const hasStarted =
    diagnosisId !== null

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-var(--bottom-nav-height)-env(safe-area-inset-bottom)-24px)] w-full max-w-6xl gap-6 px-[clamp(16px,4vw,56px)] py-(--mobile-page-y) md:min-h-[calc(100dvh-32px)] md:py-(--desktop-page-y) lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)] lg:items-center lg:gap-10 xl:gap-14">
      <aside className="min-w-0">
        <div>
          <p className="m-0 mb-2 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">
            Diagnóstico SG-SST
          </p>

          <h1 className="m-0 max-w-110 text-[clamp(1.65rem,2.5vw,2.05rem)] leading-[1.16] tracking-tighter text-balance">
            Evalúa los Estándares Mínimos aplicables a tu empresa
          </h1>

          <p className="mb-0 mt-3 max-w-110 text-sm leading-[1.6] text-txt-muted">
            Evaluación asistida de los Estándares Mínimos del SG-SST
            para empresas clasificadas en <strong>riesgo I</strong>,
            construida a partir de la información declarada durante
            el cuestionario.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:mt-8">
          <div className="rounded-xl border border-borde-light bg-capa-main px-4 py-3">
            <p className="m-0 text-sm leading-[1.55] text-txt-muted">
              La evaluación toma como referencia los Estándares Mínimos
              establecidos en la Resolución 0312 de 2019 del Ministerio
              del Trabajo.
            </p>

            <a
              href="https://www.fondoriesgoslaborales.gov.co/sin-categoria/conozca-la-resolucion-0312-de-2019/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-sm font-bold text-brand-dark underline underline-offset-2"
            >
              Consultar fuente oficial
            </a>
          </div>

          <div className="rounded-xl bg-brand-light px-4 py-3">
            <p className="m-0 text-sm leading-[1.55] text-brand-dark">
              Esta herramienta ofrece asistencia orientativa y no constituye
              una auditoría, verificación oficial, certificación de cumplimiento
              ni asesoría jurídica o profesional en Seguridad y Salud en el
              Trabajo.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 rounded-card border border-white/70 bg-capa-surface p-5 shadow-panel sm:p-6 xl:p-7">
        {!hasStarted && (
          <>
            <span className="grid size-10 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
              <ClipboardList size={22} />
            </span>

            <h2 className="mb-1.5 mt-4 text-[20px] leading-tight tracking-[-0.035em] text-balance">
              Empecemos por tu empresa
            </h2>

            <p className="m-0 mb-5 max-w-xl text-sm leading-[1.6] text-txt-muted">
              El número de trabajadores permite determinar automáticamente
              qué grupo de Estándares Mínimos debe evaluar el diagnóstico.
            </p>

            <form className="grid gap-4" onSubmit={handleStartDiagnostic}>
              <div className="grid gap-2">
                <label
                  htmlFor="worker-count"
                  className="text-sm font-bold text-txt-medium"
                >
                  ¿Cuántas personas trabajan en tu empresa?
                </label>

                <div className="flex items-center gap-3 rounded-control border border-borde-light bg-capa-main px-4 py-3 transition-colors focus-within:border-brand-primary">
                  <input
                    id="worker-count"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    value={workerCount}
                    onChange={(event) => {
                      setWorkerCount(event.target.value)
                      setErrorMessage(null)
                    }}
                    placeholder="Ej. 5"
                    className="min-w-0 flex-1 bg-transparent text-base text-txt-medium outline-none placeholder:text-txt-subtle"
                    disabled={isStarting}
                  />

                  <span className="text-sm text-txt-muted">
                    trabajadores
                  </span>
                </div>
              </div>

              {errorMessage && (
                <p
                  role="alert"
                  className="m-0 text-sm leading-normal text-red-600"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isStarting}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-brand-text shadow-button transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Preparando diagnóstico...
                  </>
                ) : (
                  'Iniciar diagnóstico'
                )}
              </button>
            </form>
          </>
        )}

        {hasStarted && currentQuestion && !result && (
          <>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
                <MessageCircle size={22} />
              </span>

              <span className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold text-brand-dark">
                Requisito {currentQuestion.requirement_number} de{' '}
                {currentQuestion.total_requirements}
              </span>
            </div>

            <h2 className="mb-1.5 mt-4 text-[20px] leading-[1.25] tracking-[-0.035em] text-balance">
              {currentQuestion.requirement_name}
            </h2>

            {catalogName && (
              <div className="mb-3 rounded-xl border border-borde-light bg-capa-main px-3 py-2">
                <p className="m-0 text-sm leading-[1.55] text-txt-muted">
                  {catalogName}
                </p>
              </div>
            )}

            <p className="m-0 mb-5 text-base leading-[1.6] text-txt-medium">
              {currentQuestion.text}
            </p>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    handleBooleanAnswer(true)
                    // handleSubmitAnswer()
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${booleanAnswer === true
                    ? 'border-brand-primary bg-brand-light text-brand-dark'
                    : 'border-borde-light bg-capa-main text-txt-medium hover:border-brand-primary'
                    }`}
                >
                  <Check size={18} />
                  Sí
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleBooleanAnswer(false)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${booleanAnswer === false
                    ? 'border-brand-primary bg-brand-light text-brand-dark'
                    : 'border-borde-light bg-capa-main text-txt-medium hover:border-brand-primary'
                    }`}
                >
                  <X size={18} />
                  No
                </button>
              </div>

              <div className="flex items-center gap-3 py-0.5">
                <span className="h-px flex-1 bg-borde-light" />

                <span className="text-xs font-medium uppercase tracking-wider text-txt-subtle">
                  o responde con tus palabras
                </span>

                <span className="h-px flex-1 bg-borde-light" />
              </div>

              <textarea
                value={textAnswer}
                disabled={isSubmitting}
                onChange={(event) => handleTextAnswer(event.target.value)}
                rows={3}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full resize-none rounded-xl border border-borde-light bg-capa-main px-4 py-3 text-base leading-[1.6] text-txt-medium outline-none transition-colors placeholder:text-txt-subtle focus:border-brand-primary"
              />

              {clarificationMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-[1.55] text-amber-800">
                  {clarificationMessage}
                </div>
              )}

              {errorMessage && (
                <p
                  role="alert"
                  className="m-0 text-sm leading-normal text-red-600"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                disabled={
                  isSubmitting ||
                  (booleanAnswer === null && textAnswer.trim().length === 0)
                }
                onClick={handleSubmitAnswer}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-brand-text shadow-button transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Procesando respuesta...
                  </>
                ) : (
                  <>
                    Enviar respuesta
                    <Send size={16} />
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {result && (
          <>
            <span className="grid size-10 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
              <Check size={22} />
            </span>

            <h2 className="mb-1.5 mt-4 text-[20px] leading-tight tracking-[-0.035em]">
              Diagnóstico completado
            </h2>

            <p className="m-0 mb-5 text-sm leading-[1.6] text-txt-muted">
              La evaluación ha finalizado. Descarga el informe con los
              resultados, la calificación y los comentarios correspondientes.
            </p>

            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="m-0 text-sm font-bold text-amber-900">
                Descarga tu informe antes de salir
              </p>

              <p className="mb-0 mt-1 text-sm leading-[1.55] text-amber-800">
                Por tu privacidad, no guardamos un historial de diagnósticos.
                Si sales de esta sección, recargas la página o la descarga se
                interrumpe, es posible que tengas que realizar nuevamente el
                cuestionario.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={isDownloadingReport}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-brand-text shadow-button transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloadingReport ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Generando informe...
                </>
              ) : (
                <>
                  <Download size={17} />
                  Descargar diagnóstico en PDF
                </>
              )}
            </button>

            {reportError && (
              <p
                role="alert"
                className="mt-4 text-sm leading-normal text-red-600"
              >
                {reportError}
              </p>
            )}

            <p className="mb-0 mt-4 text-sm leading-[1.55] text-txt-muted">
              El informe es orientativo y se construye a partir de la
              información declarada durante el diagnóstico.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
