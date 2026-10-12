import { Check } from 'lucide-react'

type DiagnosticToastProps = {
  message: string
}

export function DiagnosticToast({ message }: DiagnosticToastProps) {
  return (
    <div
      className="fixed right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-50 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-light px-3 py-2 text-sm font-bold text-brand-dark shadow-soft md:right-6 md:top-6"
      role="status"
      aria-live="polite"
    >
      <Check size={16} aria-hidden="true" />
      {message}
    </div>
  )
}
