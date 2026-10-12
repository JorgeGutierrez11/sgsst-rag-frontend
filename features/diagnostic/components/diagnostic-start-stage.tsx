import type { FormEventHandler } from 'react'
import { ClipboardList, LoaderCircle } from 'lucide-react'

type DiagnosticStartStageProps = {
  companyName: string
  workerCount: string
  errorMessage: string | null
  isStarting: boolean
  onCompanyNameChange: (value: string) => void
  onWorkerCountChange: (value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function DiagnosticStartStage({
  companyName,
  workerCount,
  errorMessage,
  isStarting,
  onCompanyNameChange,
  onWorkerCountChange,
  onSubmit,
}: DiagnosticStartStageProps) {
  return (
    <>
      <span className="grid size-10 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
        <ClipboardList size={22} aria-hidden="true" />
      </span>

      <h2 className="mb-1.5 mt-4 text-[20px] leading-tight tracking-[-0.035em] text-balance">
        Empecemos por tu empresa
      </h2>

      <p className="m-0 mb-5 max-w-xl text-sm leading-[1.6] text-txt-muted">
        El nombre de la empresa se incluirá en el informe y el número de
        trabajadores permite determinar automáticamente qué grupo de Estándares
        Mínimos debe evaluar el diagnóstico.
      </p>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <label htmlFor="company-name" className="text-sm font-bold text-txt-medium">
            Nombre de la empresa
          </label>

          <div className="flex items-center rounded-control border border-borde-light bg-capa-main px-4 py-3 transition-colors focus-within:border-brand-primary">
            <input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(event) => onCompanyNameChange(event.target.value)}
              placeholder="Ej. Taller El Progreso"
              autoComplete="organization"
              className="min-w-0 flex-1 bg-transparent text-base text-txt-medium outline-none placeholder:text-txt-subtle"
              disabled={isStarting}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="worker-count" className="text-sm font-bold text-txt-medium">
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
              onChange={(event) => onWorkerCountChange(event.target.value)}
              placeholder="Ej. 5"
              className="min-w-0 flex-1 bg-transparent text-base text-txt-medium outline-none placeholder:text-txt-subtle"
              disabled={isStarting}
            />

            <span className="text-sm text-txt-muted">trabajadores</span>
          </div>
        </div>

        {errorMessage && (
          <p role="alert" className="m-0 text-sm leading-normal text-red-600">
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
  )
}
