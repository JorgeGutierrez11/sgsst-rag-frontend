import { FileText, X } from 'lucide-react'
import { useEffect } from 'react'
import { MarkdownMessage } from '@/pages/consultation/components/markdown-message'

type ChunkReferenceModalProps = {
  reference: string
  chunk: string
  onClose: () => void
}

export function ChunkReferenceModal({ reference, chunk, onClose }: ChunkReferenceModalProps) {
  // Cerrar con Escape - comportamiento esperado en cualquier ventana flotante.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="chunk-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="chunk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chunk-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="chunk-modal-header">
          <p id="chunk-modal-title">
            <FileText size={14} />
            {reference}
          </p>
          <button type="button" className="chunk-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        <div className="chunk-modal-body">
          <MarkdownMessage content={chunk} />
        </div>
      </div>
    </div>
  )
}