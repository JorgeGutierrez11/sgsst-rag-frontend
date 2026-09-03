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
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isComposingText = event.nativeEvent.isComposing || event.keyCode === IME_COMPOSITION_KEY_CODE

    if (event.key === 'Enter' && !isComposingText) {
      onSend()
    }
  }

  return (
    <div className="sticky bottom-0 bg-linear-to-t from-capa-main via-capa-main to-transparent pt-3 max-md:pt-2.5">
      <div className="flex items-center rounded-full border border-borde-light bg-capa-surface py-1.5 pl-4 pr-1.5 shadow-soft transition-[border-color,box-shadow] focus-within:border-brand-primary focus-within:shadow-[0_0_0_4px_hsl(var(--focus-ring)/0.34)]">
        <input
          className="min-w-0 flex-1 bg-transparent text-[13px] text-txt-medium outline-0 placeholder:text-txt-subtle"
          aria-label="Escribe tu consulta"
          name="consultation-question"
          autoComplete="off"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu consulta…"
        />
        <button className="grid size-9.5 place-items-center rounded-full bg-brand-primary text-brand-text transition-[background-color,transform,opacity] hover:-translate-y-0.5 hover:bg-brand-dark active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0" onClick={onSend} disabled={!input.trim() || loading} aria-label="Enviar consulta">
          <Send size={18} />
        </button>
      </div>
      <p className="m-0 mt-2 text-center text-xs text-txt-muted">NormIA puede cometer errores. Verifica la información importante.</p>
    </div>
  )
}
