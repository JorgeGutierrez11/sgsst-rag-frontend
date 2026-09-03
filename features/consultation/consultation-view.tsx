'use client'

import { useState } from 'react'
import { ArrowUp, Info, MessageCircle, X } from 'lucide-react'
import { queryConsultation } from '@/features/consultation/api/consultation-api'
import { ConsultationComposer } from '@/features/consultation/components/consultation-composer'
import type { ConsultationMessage } from '@/features/consultation/model/consultation.types'
import { consultationExamples } from '@/features/consultation/model/examples'
import { MessageList } from '@/features/consultation/components/message-list'

export function ConsultationView() {
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID())
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null)

  const send = async (text = input) => {
    const question = text.trim()
    const userMessageId = crypto.randomUUID()

    if (!question || loading) return

    setInput('')
    setError('')

    setFocusedMessageId(userMessageId)
    setMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: 'user',
        content: question
      }
    ])
    setLoading(true)

    try {
      const response = await queryConsultation({
        question,
        conversation_id: conversationId,
      })

      setConversationId(response.conversation_id)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.answer,
          references: response.references,
          chunks: response.chunks,
        },
      ])
    } catch {
      setError('No pudimos obtener una respuesta de la API. Intenta nuevamente cuando el servicio esté disponible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto grid h-[calc(100dvh-var(--bottom-nav-height)-env(safe-area-inset-bottom))] min-h-0 w-full md:max-w-205 grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(12px,2vh,18px)] px-[clamp(16px,5vw,86px)] py-(--mobile-page-y) md:h-dvh md:py-(--desktop-page-y)">
      <div className="flex items-center gap-3.25">
        <div className="grid size-11 place-items-center rounded-[13px] bg-brand-light text-brand-primary"><MessageCircle size={22} /></div>
        <div>
          <p className="m-0 mb-1.25 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">Consulta normativa</p>
          <h1 className="m-0 text-[23px] tracking-tighter text-balance max-md:text-[22px]">¿Qué necesitas saber?</h1>
        </div>
      </div>
      {messages.length === 0 ? (
        <div className="mx-auto self-center px-5 py-6 text-center max-md:py-4.5">
          <p className="mx-auto mb-6 mt-0 max-w-95 text-sm leading-[1.6] text-txt-muted">Haz una pregunta sobre normativa laboral, prevención o gestión de personas.</p>
          <div className="mx-auto grid max-w-125 gap-2.5">
            {consultationExamples.map((example) => (
              <button key={example} className="flex items-center justify-between gap-3 rounded-xl border border-borde-light bg-capa-surface px-3.75 py-3.25 text-left text-xs text-txt-muted transition-[color,background-color,border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-borde-gray hover:shadow-soft active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => send(example)} disabled={loading}>
                {example}<ArrowUp className="rotate-45 text-brand-primary" size={15} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          loading={loading}
          focusedMessageId={focusedMessageId}
        />
      )}
      {error && (
        <p className="flex items-center gap-1.75 rounded-xl bg-status-error-light px-3 py-2.5 text-xs text-status-error-main" role="alert">
          <Info size={15} /> {error}
          <button className="ml-auto text-inherit" onClick={() => setError('')} aria-label="Cerrar error"><X size={14} /></button>
        </p>
      )}
      <ConsultationComposer input={input} loading={loading} onInputChange={setInput} onSend={() => send()} />
    </section>
  )
}
