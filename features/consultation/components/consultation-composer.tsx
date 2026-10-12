
import { useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

const IME_COMPOSITION_KEY_CODE = 229

type ConsultationComposerProps = {
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
}

export function ConsultationComposer({
  input,
  loading,
  onInputChange,
  onSend,
}: ConsultationComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = input.trim().length > 0 && !loading

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Restablecer la altura para calcular el contenido real.
    textarea.style.height = 'auto'

    // Crecer hasta el límite y después permitir scroll interno.
    const maxHeight = Math.min(320, window.innerHeight * 0.4)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)

    textarea.style.height = `${newHeight}px`
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [input])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isComposingText =
      event.nativeEvent.isComposing ||
      event.keyCode === IME_COMPOSITION_KEY_CODE

    if (event.key === 'Enter' && !event.shiftKey && !isComposingText) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <div className="sticky bottom-0 w-full bg-linear-to-t from-capa-surface via-capa-surface to-transparent pt-3">
      <div className="flex items-end gap-2 rounded-2xl border border-brand-primary/20 bg-capa-surface p-2 shadow-sm transition-[border-color,box-shadow] duration-200 focus-within:border-brand-primary/50 focus-within:shadow-md">
        <textarea
          ref={textareaRef}
          className="min-h-10 min-w-0 flex-1 resize-none overflow-y-hidden border-0! bg-transparent px-3 py-2.5 text-sm leading-relaxed text-txt-medium outline-none! ring-0! placeholder:text-txt-subtle"
          aria-label="Escribe tu consulta"
          name="consultation-question"
          autoComplete="off"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu consulta..."
          rows={1}
        />

        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-brand-text transition-[background-color,transform,opacity] duration-200 hover:bg-brand-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-brand-primary"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Enviar consulta"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="m-0 mt-2 px-2 text-center text-[11px] leading-relaxed text-txt-muted">
        NormIA puede cometer errores. Verifica la información importante.
      </p>
    </div>
  )
}
