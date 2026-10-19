import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

import type { RequirementTransitionNotice } from '@/features/diagnostic/hooks/use-diagnostic-session'

const TRANSITION_STYLES = `
@keyframes normia-transition-enter {
  0% { opacity: 0; transform: translateY(10px) scale(0.96); }
  19%, 73% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-7px) scale(0.98); }
}
@keyframes normia-transition-mark {
  0%, 18% { transform: rotate(-12deg) scale(0.9); opacity: 1; }
  45% { transform: rotate(6deg) scale(1.16); opacity: 1; }
  65%, 100% { transform: rotate(12deg) scale(0.6); opacity: 0; }
}
@keyframes normia-transition-check {
  0%, 37% { opacity: 0; transform: scale(0.5) rotate(-20deg); }
  58%, 100% { opacity: 1; transform: scale(1) rotate(0); }
}
.normia-transition-panel { animation: normia-transition-enter 1150ms ease-in-out both; }
.normia-transition-mark { animation: normia-transition-mark 1150ms ease-in-out both; }
.normia-transition-check { animation: normia-transition-check 1150ms ease-in-out both; }
@media (prefers-reduced-motion: reduce) {
  .normia-transition-panel,
  .normia-transition-mark,
  .normia-transition-check { animation: none; }
  .normia-transition-mark { opacity: 0; }
  .normia-transition-check { opacity: 1; transform: none; }
}
`

type DiagnosticRequirementTransitionProps = {
  notice: RequirementTransitionNotice
}

export function DiagnosticRequirementTransition({ notice }: DiagnosticRequirementTransitionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  const updated = notice.kind === 'updated'
  const title = updated
    ? `Requisito ${notice.requirementNumber} actualizado`
    : `Requisito ${notice.requirementNumber} guardado`
  const message = notice.nextRequirementNumber === null
    ? 'Todos los requisitos están respondidos. Preparando el resultado.'
    : updated
      ? `Retomamos el requisito ${notice.nextRequirementNumber}, donde habías quedado.`
      : `Continuamos con el requisito ${notice.nextRequirementNumber}.`

  return (
    <>
      <style>{TRANSITION_STYLES}</style>
      <dialog
        ref={dialogRef}
        aria-label={title}
        aria-describedby="requirement-transition-description"
        onCancel={(event) => event.preventDefault()}
        className="m-auto w-[calc(100%-2rem)] max-w-sm overflow-visible border-0 bg-transparent p-0 text-txt-bold backdrop:bg-slate-950/35 backdrop:backdrop-blur-[2px]"
      >
        <div className="normia-transition-panel rounded-3xl border border-brand-primary/20 bg-capa-surface px-6 py-8 text-center shadow-2xl sm:px-8">
          <div className="relative mx-auto mb-4 grid size-24 place-items-center" aria-hidden="true">
            <svg
              className="normia-transition-mark absolute size-20 text-brand-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
            </svg>
            <div className="normia-transition-check absolute grid size-18 place-items-center rounded-full bg-brand-primary text-brand-text shadow-lg">
              <Check size={42} strokeWidth={3} />
            </div>
          </div>
          <p className="m-0 text-xl font-bold leading-tight" role="status" aria-live="polite">
            {title}
          </p>
          <p id="requirement-transition-description" className="mb-0 mt-2 text-sm leading-relaxed text-txt-medium">
            {message}
          </p>
        </div>
      </dialog>
    </>
  )
}
