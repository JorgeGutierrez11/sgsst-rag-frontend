import { Check, Download, LoaderCircle, RotateCcw } from 'lucide-react'

type DiagnosticResultStageProps = {
  isDownloadingReport: boolean
  reportError: string | null
  onDownloadReport: () => Promise<void>
  onRestart: () => void
}

export function DiagnosticResultStage({
  isDownloadingReport,
  reportError,
  onDownloadReport,
  onRestart,
}: DiagnosticResultStageProps) {
  return (
    <>
      <span className="grid size-10 place-items-center rounded-[13px] bg-brand-light text-brand-primary">
        <Check size={22} />
      </span>

      <h2 className="mb-1.5 mt-4 text-[20px] leading-tight tracking-[-0.035em]">
        Diagnóstico completado
      </h2>

      <p className="m-0 mb-5 text-sm leading-[1.6] text-txt-muted">
        La evaluación ha finalizado. Descarga el informe con los resultados, la
        calificación y los comentarios correspondientes.
      </p>

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="m-0 text-sm font-bold text-amber-900">
          Descarga tu informe antes de salir
        </p>

        <p className="mb-0 mt-1 text-sm leading-[1.55] text-amber-800">
          Por tu privacidad, no guardamos un historial de diagnósticos. Si sales
          de esta sección, recargas la página o la descarga se interrumpe, es
          posible que tengas que realizar nuevamente el cuestionario.
        </p>
      </div>

      <button
        type="button"
        onClick={onDownloadReport}
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
        onClick={onRestart}
        disabled={isDownloadingReport}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-borde-light bg-capa-main px-5 py-3 text-sm font-bold text-txt-medium transition hover:border-brand-primary hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw size={16} />
        Volver a empezar
      </button>

      {reportError && (
        <p role="alert" className="mt-4 text-sm leading-normal text-red-600">
          {reportError}
        </p>
      )}

      <p className="mb-0 mt-4 text-sm leading-[1.55] text-txt-muted">
        El informe es orientativo y se construye a partir de la información
        declarada durante el diagnóstico.
      </p>
    </>
  )
}
