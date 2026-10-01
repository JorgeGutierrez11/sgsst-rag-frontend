import type { KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

const IME_COMPOSITION_KEY_CODE = 229

type ConsultationComposerProps = {
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
}

export function ConsultationComposer({ input, loading, onInputChange, onSend }: ConsultationComposerProps) {
  const canSend = input.trim().length > 0 && !loading

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isComposingText = event.nativeEvent.isComposing || event.keyCode === IME_COMPOSITION_KEY_CODE

    if (event.key === 'Enter' && !event.shiftKey && !isComposingText) {
      event.preventDefault()
      if (!canSend) return

      onSend()
    }
  }

  return (
    <div className="sticky bottom-0 bg-linear-to-t from-capa-surface via-capa-surface to-transparent pt-2">
      <div className="flex items-end gap-2 rounded-[20px] border border-brand-primary/20 bg-capa-surface p-2 shadow-glow ring-4 ring-brand-primary/10 transition-[border-color,box-shadow] focus-within:border-brand-primary/50 focus-within:ring-brand-primary/20">
        <textarea
          className="min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-txt-medium border-0! outline-none! ring-0! placeholder:text-txt-subtle"
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
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-2 text-xs font-bold text-brand-text transition-[background-color,transform,opacity] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          onClick={onSend}
          disabled={!canSend}
          aria-label="Enviar consulta"
        >
          Enviar
          <Send size={15} aria-hidden="true" />
        </button>
      </div>
      <p className="m-0 mt-2 text-center text-xs text-txt-muted">
        NormIA puede cometer errores. Verifica la información importante.
      </p>
    </div>
  )
}
