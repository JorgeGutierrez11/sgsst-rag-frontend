import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

const loadingMessages = [
  'Analizando tu consulta ',
  'Consultando la normativa aplicable ',
  'Revisando los requisitos relacionados ',
  'Preparando una respuesta fundamentada ',
]

export function AssistantLoading() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((current) =>
        current < loadingMessages.length - 1 ? current + 1 : current,
      )
    }, 4500)

    return () => window.clearInterval(intervalId)
  }, [])

  const message = loadingMessages[messageIndex]

  return (
    <div className="flex items-start gap-2.5">
      <div className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-light text-brand-primary shadow-sm">
        <Sparkles size={15} aria-hidden="true" />
      </div>

      <div
        className="flex items-center gap-2 rounded-[22px] rounded-tl-md border border-white/70 bg-capa-surface px-4 py-3 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <span className="text-sm text-txt-subtle">{message}</span>

        <div className="flex gap-1" aria-hidden="true">
          <span className="size-1.25 animate-bounce rounded-full bg-txt-subtle" />
          <span className="size-1.25 animate-bounce rounded-full bg-txt-subtle [animation-delay:150ms]" />
          <span className="size-1.25 animate-bounce rounded-full bg-txt-subtle [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}