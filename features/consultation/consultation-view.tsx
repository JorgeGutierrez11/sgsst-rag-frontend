'use client'

import { useState } from 'react'
import { ArrowUp, Info, MessageCircle, X } from 'lucide-react'
import { ConsultationComposer } from '@/features/consultation/consultation-composer'
import type { ConsultationMessage } from '@/features/consultation/consultation.types'
import { consultationExamples } from '@/features/consultation/examples'
import { MessageList } from '@/features/consultation/message-list'

const mockAssistantMessage: ConsultationMessage = {
  role: 'assistant',
  content: 'He revisado tu consulta. Como orientación inicial, conviene identificar la normativa aplicable a tu actividad y documentar las medidas adoptadas. Esta respuesta es informativa y debe contrastarse con la fuente oficial correspondiente.',
  references: ['Ley 31/1995 de Prevención de Riesgos Laborales', 'Guía técnica del INSST'],
}

export function ConsultationView() {
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const send = async (text = input) => {
    const value = text.trim()

    if (!value || loading) return

    setInput('')
    setError('')
    setMessages((current) => [...current, { role: 'user', content: value }])
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setLoading(false)
    setMessages((current) => [...current, mockAssistantMessage])
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
              <button key={example} className="example-chip" onClick={() => send(example)}>
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
