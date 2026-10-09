'use client'

import {
  Check,
  ClipboardList,
  Download,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from 'lucide-react'

import { useDiagnosticSession } from '@/features/diagnostic/hooks/use-diagnostic-session'

export function DiagnosticView() {
  const {
    companyName,
    workerCount,
    catalogName,
    currentQuestion,
    textAnswer,
    result,
    clarificationMessage,
    isStarting,
    isSubmitting,
    errorMessage,
    isDownloadingReport,
    reportError,
    toastMessage,
    hasStarted,
    handleCompanyNameChange,
    handleWorkerCountChange,
    handleStartDiagnostic,
    handleTextAnswer,
    handleSubmitAnswer,
    handleDownloadReport,
    handleRestartDiagnostic,
  } = useDiagnosticSession()

  return (
    <section className="mx-auto grid h-full min-h-0 w-full max-w-6xl gap-6 overflow-y-auto overflow-x-hidden px-[clamp(16px,4vw,56px)] py-(--mobile-page-y) md:py-(--desktop-page-y) lg:content-center lg:overflow-visible lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)] lg:gap-x-10 lg:gap-y-6 xl:gap-x-14">
      {/* Encabezado: primera posición en móvil, columna izquierda en escritorio */}
      <header className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
        <p className="m-0 mb-2 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">
          Diagnóstico SG-SST
        </p>

        <h1 className="m-0 max-w-110 text-[clamp(1.65rem,2.5vw,2.05rem)] leading-[1.16] tracking-tighter text-balance">
          Evalúa los Estándares Mínimos aplicables a tu empresa
        </h1>

        <p className="mb-0 mt-3 max-w-110 text-sm leading-[1.6] text-txt-muted">
          Evaluación asistida de los Estándares Mínimos del SG-SST para
          empresas clasificadas en <strong>riesgo I</strong>, construida
          a partir de la información declarada durante el cuestionario.
        </p>
      </header>

      {/* Interacción: segunda posición en móvil, columna derecha en escritorio */}
      <div className="min-w-0 rounded-card border border-white/70 bg-capa-surface p-5 shadow-panel sm:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center xl:p-7">
        {!hasStarted && (
          <>
            <span className="grid size-10 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
              <ClipboardList size={22} />
            </span>

            <h2 className="mb-1.5 mt-4 text-[20px] leading-tight tracking-[-0.035em] text-balance">
              Empecemos por tu empresa
            </h2>

            <p className="m-0 mb-5 max-w-xl text-sm leading-[1.6] text-txt-muted">
              El nombre de la empresa se incluirá en el informe y el número de
              trabajadores permite determinar automáticamente qué grupo de
              Estándares Mínimos debe evaluar el diagnóstico.
            </p>

            <form className="grid gap-4" onSubmit={handleStartDiagnostic}>
              <div className="grid gap-2">
                <label
                  htmlFor="company-name"
                  className="text-sm font-bold text-txt-medium"
                >
                  Nombre de la empresa
                </label>

                <div className="flex items-center rounded-control border border-borde-light bg-capa-main px-4 py-3 transition-colors focus-within:border-brand-primary">
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(event) =>
                      handleCompanyNameChange(event.target.value)
                    }
                    placeholder="Ej. Taller El Progreso"
                    autoComplete="organization"
                    className="min-w-0 flex-1 bg-transparent text-base text-txt-medium outline-none placeholder:text-txt-subtle"
                    disabled={isStarting}
                  />
                </div>
              </div>

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
                    onChange={(event) =>
                      handleWorkerCountChange(event.target.value)
                    }
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
                  <MessageCircle size={22} />
                </span>

                <span className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold text-brand-dark">
                  Requisito {currentQuestion.requirement_number} de{' '}
                  {currentQuestion.total_requirements}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRestartDiagnostic}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-full border border-borde-light bg-capa-main px-3 py-2 text-xs font-bold text-txt-muted transition hover:border-brand-primary hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={14} />
                Volver a empezar
              </button>
            </div>

            <h2 className="mb-1.5 mt-4 text-[20px] leading-tight tracking-[-0.035em] text-balance font-bold">
              {currentQuestion.requirement_name}
            </h2>

            {catalogName && (
              <div className="mb-4">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">
                  Ámbito del diagnóstico
                </p>

                <p className="mb-0 mt-1 text-sm leading-[1.55] text-txt-medium">
                  {catalogName}
                </p>
              </div>
            )}

            <div className="mb-5 rounded-r-xl border-l-4 border-brand-primary bg-brand-light/60 px-4 py-3">
              <p className="m-0 text-base leading-[1.6] text-txt-medium font-bold">
                {currentQuestion.text}
              </p>
            </div>

            {toastMessage && (
              <div
                className="fixed right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-50 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-light px-3 py-2 text-sm font-bold text-brand-dark shadow-soft md:right-6 md:top-6"
                role="status"
                aria-live="polite"
              >
                <Check size={16} aria-hidden="true" />
                {toastMessage}
              </div>
            )}

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitAnswer(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-borde-light bg-capa-main px-4 py-3 text-sm font-bold text-txt-medium transition hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check size={18} />
                  Sí
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitAnswer(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-borde-light bg-capa-main px-4 py-3 text-sm font-bold text-txt-medium transition hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
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
                  textAnswer.trim().length === 0
                }
                onClick={() => handleSubmitAnswer()}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-primary px-5 py-3 text-sm font-bold text-brand-text shadow-button transition-[color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Procesando respuesta...
                  </>
                ) : (
                  <>
                    Enviar respuesta escrita
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

            <button
              type="button"
              onClick={handleRestartDiagnostic}
              disabled={isDownloadingReport}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-borde-light bg-capa-main px-5 py-3 text-sm font-bold text-txt-medium transition hover:border-brand-primary hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Volver a empezar
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

      {/* Avisos: después de la interacción en móvil, bajo el título en escritorio */}
      <aside className="grid min-w-0 content-start gap-3 lg:col-start-1 lg:row-start-2">
        <div className="rounded-xl border border-borde-light bg-capa-main px-4 py-3">
          <p
            lang="es"
            className="m-0 text-sm leading-[1.55] text-txt-muted xl:text-justify xl:hyphens-auto"
          >
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
          <p
            lang="es"
            className="m-0 text-sm leading-[1.55] text-brand-dark xl:text-justify xl:hyphens-auto"
          >
            Esta herramienta ofrece asistencia orientativa y no constituye
            una auditoría, verificación oficial, certificación de cumplimiento
            ni asesoría jurídica o profesional en Seguridad y Salud en el
            Trabajo.
          </p>
        </div>
      </aside>
    </section>
  )
}
