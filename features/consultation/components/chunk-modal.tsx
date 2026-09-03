import { FileText, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { MarkdownMessage } from '@/features/consultation/components/markdown-message'

type ChunkReferenceModalProps = {
  reference: string
  chunk: string
  onClose: () => void
}

export function ChunkReferenceModal({ reference, chunk, onClose }: ChunkReferenceModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null

    closeButtonRef.current?.focus()

    return () => previouslyFocusedElement?.focus()
  }, [])

  // Cerrar con Escape - comportamiento esperado en cualquier ventana flotante.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-1000 flex items-end justify-center bg-[hsl(var(--shadow-strong)/0.45)] p-4 backdrop-blur overscroll-contain md:items-center md:p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(90dvh-var(--bottom-nav-height))] w-full max-w-160 flex-col rounded-[14px] border border-borde-light bg-capa-surface shadow-modal md:max-h-[80dvh] md:rounded-[18px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chunk-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 rounded-t-[14px] border-b border-borde-light bg-capa-soft py-3.5 pr-4 pl-4.5 md:rounded-t-[18px]">
          <p
            id="chunk-modal-title"
            className="m-0 flex min-w-0 items-center gap-1.75 truncate text-[13px] font-bold text-txt-bold"
          >
            <FileText className="shrink-0 text-brand-primary" size={14} />
            {reference}
          </p>

          <button
            ref={closeButtonRef}
            type="button"
            className="shrink-0 rounded-lg p-1.5 leading-none text-txt-muted transition-[background-color,color] hover:bg-capa-muted hover:text-txt-bold"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 text-sm leading-6 text-txt-medium">
          <MarkdownMessage content={chunk} />
        </div>
      </div>
    </div>
  )
}
