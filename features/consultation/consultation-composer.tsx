import type { KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

type ConsultationComposerProps = {
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
}

export function ConsultationComposer({ input, loading, onInputChange, onSend }: ConsultationComposerProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      onSend()
    }
  }

  return (
    <div className="composer-wrap">
      <div className="composer">
        <input
          aria-label="Escribe tu consulta"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu consulta..."
        />
        <button className="send-button" onClick={onSend} disabled={!input.trim() || loading} aria-label="Enviar consulta">
          <Send size={18} />
        </button>
      </div>
      <p>ChattyAI puede cometer errores. Verifica la información importante.</p>
    </div>
  )
}
