'use client'

import { useState } from 'react'
import { ArrowUp, Info, MessageCircle, X } from 'lucide-react'
import { queryConsultation } from '@/features/consultation/consultation-api'
import { ConsultationComposer } from '@/features/consultation/consultation-composer'
import type { ConsultationMessage } from '@/features/consultation/consultation.types'
import { consultationExamples } from '@/features/consultation/examples'
import { MessageList } from '@/features/consultation/message-list'

export function ConsultationView() {
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID())

  const send = async (text = input) => {
    const question = text.trim()

    if (!question || loading) return

    setInput('')
    setError('')
    setMessages((current) => [...current, { role: 'user', content: question }])
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
          role: 'assistant',
          content: response.answer,
          references: response.references,
        },
      ])
    } catch {
      setError('No pudimos obtener una respuesta de la API. Intenta nuevamente cuando el servicio esté disponible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="chat-view page-pad">
      <div className="chat-intro">
        <div className="chat-icon"><MessageCircle size={22} /></div>
        <div>
          <p className="eyebrow">Consulta normativa</p>
          <h1>¿Qué necesitas saber?</h1>
        </div>
      </div>
      {messages.length === 0 ? (
        <div className="empty-chat">
          <p>Haz una pregunta sobre normativa laboral, prevención o gestión de personas.</p>
          <div className="example-list">
            {consultationExamples.map((example) => (
              <button key={example} className="example-chip" onClick={() => send(example)} disabled={loading}>
                {example}<ArrowUp size={15} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList messages={messages} loading={loading} />
      )}
      {error && (
        <p className="error-message" role="alert">
          <Info size={15} /> {error}
          <button onClick={() => setError('')} aria-label="Cerrar error"><X size={14} /></button>
        </p>
      )}
      <ConsultationComposer input={input} loading={loading} onInputChange={setInput} onSend={() => send()} />
    </section>
  )
}
