import { FileText, Sparkles, UserRound } from 'lucide-react'
import { MarkdownMessage } from '@/pages/consultation/components/markdown-message'
import type { ConsultationMessage } from '@/pages/consultation/model/consultation.types'
import { useEffect, useRef, useState } from 'react'
import { ChunkReferenceModal } from './chunk-modal'

type MessageListProps = {
  messages: ConsultationMessage[]
  loading: boolean
  focusedMessageId: string | null
}

export function MessageList({ messages, loading, focusedMessageId }: MessageListProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const focusedMessageRef = useRef<HTMLDivElement | null>(null)
  const [activeReference, setActiveReference] = useState<{ label: string; chunk: string } | null>(null)

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current
    const focusedMessage = focusedMessageRef.current

    if (!messagesContainer || !focusedMessage) return

    const containerBounds = messagesContainer.getBoundingClientRect()
    const messageBounds = focusedMessage.getBoundingClientRect()

    messagesContainer.scrollTo({
      top: messagesContainer.scrollTop + messageBounds.top - containerBounds.top,
      behavior: 'smooth',
    })
  }, [focusedMessageId, messages.length])

  return (
    <div className="messages" aria-live="polite" ref={messagesContainerRef}>
      {messages.map((message, index) => (
        <div
          ref={message.id === focusedMessageId ? focusedMessageRef : null}
          className={`message-row ${message.role}`}
          key={`${message.role}-${index}`}
          tabIndex={message.id === focusedMessageId ? -1 : undefined}
        >
          <div className="avatar">{message.role === 'assistant' ? <Sparkles size={15} /> : <UserRound size={15} />}</div>
          <div className="message-bubble">
            {message.role === 'assistant' ? (
              <MarkdownMessage content={message.content} />
            ) : (
              <p className="plain-message">{message.content}</p>
            )}
            {message.references && message.references.length > 0 && message.chunks && message.chunks.length > 0 && (
              <div className="references">
                <p><FileText size={14} /> Fuentes consultadas</p>
                {message.references.map((reference, refIndex) => {
                  const chunk = message.chunks?.[refIndex] ?? null;
                  return (
                    <button
                      key={`${reference}-${refIndex}`}
                      type="button"
                      disabled={!chunk}
                      onClick={() => chunk && setActiveReference({ label: reference, chunk })}
                    >
                      <span>{refIndex + 1}</span>{reference}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ))}
      {activeReference && (
        <ChunkReferenceModal
          reference={activeReference.label}
          chunk={activeReference.chunk}
          onClose={() => setActiveReference(null)}
        />
      )}
      {loading && (
        <div className="message-row assistant">
          <div className="avatar"><Sparkles size={15} /></div>
          <span className="sr-only">NormIA está preparando la respuesta.</span>
          <div className="message-bubble typing" aria-hidden="true"><span /><span /><span /></div>
        </div>
      )}
    </div>
  )
}
