import { CheckCircle2, Circle, CircleDot, RotateCcw } from 'lucide-react'

import type { DiagnosticRequirementProgress } from '@/features/diagnostic/diagnostic.types'

type RequirementsSidebarProps = {
  requirements: DiagnosticRequirementProgress[]
  activeRequirementId: string | null
  disabled: boolean
  readOnly: boolean
  onRecheck: (requirement: DiagnosticRequirementProgress) => void
}

export function DiagnosticRequirementsSidebar({
  requirements,
  activeRequirementId,
  disabled,
  readOnly,
  onRecheck,
}: RequirementsSidebarProps) {
  const completed = requirements.filter((item) => item.status === 'completed').length
  const percentage = requirements.length ? (completed / requirements.length) * 100 : 0

  return (
    <div className="rounded-2xl border border-borde-light bg-capa-main/60 p-3 sm:p-4">
      <h2 className="m-0 text-base font-bold text-txt-bold">Progreso del diagnóstico</h2>
      <p className="mb-2 mt-1 text-sm text-txt-medium">
        {completed} de {requirements.length} requisitos respondidos
      </p>
      <div
        role="progressbar"
        aria-label="Requisitos respondidos"
        aria-valuemin={0}
        aria-valuemax={requirements.length}
        aria-valuenow={completed}
        className="h-2 overflow-hidden rounded-full bg-brand-primary/15"
      >
        <div className="h-full rounded-full bg-brand-primary transition-[width] motion-reduce:transition-none" style={{ width: `${percentage}%` }} />
      </div>
      <p className="mb-3 mt-2 text-xs text-txt-muted">
        {readOnly
          ? 'El informe ya se generó. Este diagnóstico es de solo lectura.'
          : 'Selecciona un requisito respondido o en curso para rehacerlo desde el principio.'}
      </p>
      {/* Scroll propio desde md; en móvil la lista sigue el scroll de la página para no atrapar el dedo */}
      <ol className="m-0 list-none space-y-1 p-0 md:max-h-[min(56vh,520px)] md:overflow-y-auto md:pr-1">
        {requirements.map((requirement) => {
          const isCurrent = requirement.requirement_id === activeRequirementId
          const canRecheck = requirement.status !== 'pending' && !disabled && !readOnly
          const colorClass = isCurrent
            ? 'border-brand-primary bg-brand-light/60 text-txt-bold'
            : requirement.status === 'pending'
              ? 'border-transparent text-txt-subtle'
              : 'border-transparent text-txt-medium hover:border-brand-primary/30 hover:bg-brand-light/35'

          return (
            <li key={requirement.requirement_id}>
              <button
                type="button"
                disabled={!canRecheck}
                onClick={() => onRecheck(requirement)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${requirement.requirement_number}. ${requirement.requirement_name}. ${requirement.status === 'completed' ? 'Respondido' : requirement.status === 'in_progress' ? 'En curso' : 'Pendiente'}${canRecheck ? '. Rehacer requisito' : ''}`}
                title={canRecheck ? 'Rehacer este requisito' : undefined}
                className={`flex w-full items-start gap-2 rounded-lg border px-2 py-2.5 text-left text-xs leading-relaxed transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-primary disabled:cursor-default ${colorClass}`}
              >
                <span className="mt-0.5 shrink-0">
                  {requirement.status === 'completed' ? (
                    <CheckCircle2 size={17} className="text-brand-primary" aria-hidden="true" />
                  ) : requirement.status === 'in_progress' ? (
                    <CircleDot size={17} className="text-brand-dark" aria-hidden="true" />
                  ) : (
                    <Circle size={17} className="text-txt-subtle" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold">{requirement.requirement_number}. {requirement.requirement_name}</span>
                  <span className="mt-0.5 block text-[11px]">
                    {requirement.status === 'completed' ? 'Respondido' : requirement.status === 'in_progress' ? 'En curso' : 'Pendiente'}
                  </span>
                </span>
                {canRecheck && <RotateCcw size={14} className="mt-1 shrink-0 text-brand-dark" aria-hidden="true" />}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
