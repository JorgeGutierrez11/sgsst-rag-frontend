import { FileText, Sparkles, UserRound } from 'lucide-react'
import type { ConsultationMessage } from '@/features/consultation/consultation.types'

type MessageListProps = {
  messages: ConsultationMessage[]
  loading: boolean
}

export function MessageList({ messages, loading }: MessageListProps) {
  return (
    <div className="messages" aria-live="polite">
      {messages.map((message, index) => (
        <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
          <div className="avatar">{message.role === 'assistant' ? <Sparkles size={15} /> : <UserRound size={15} />}</div>
          <div className="message-bubble">
            {message.content}
            {message.references && (
              <div className="references">
                <p><FileText size={14} /> Fuentes consultadas</p>
                {message.references.map((reference, refIndex) => (
                  <button key={reference}><span>{refIndex + 1}</span>{reference}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="message-row assistant">
          <div className="avatar"><Sparkles size={15} /></div>
          <div className="message-bubble typing"><span /><span /><span /></div>
        </div>
      )}
    </div>
  )
}
