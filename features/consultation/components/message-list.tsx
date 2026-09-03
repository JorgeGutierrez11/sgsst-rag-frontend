import { FileText, Sparkles, UserRound } from 'lucide-react'
import { MarkdownMessage } from '@/features/consultation/components/markdown-message'
import type { ConsultationMessage } from '@/features/consultation/model/consultation.types'
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

  const [activeReference, setActiveReference] = useState<{
    label: string
    chunk: string
  } | null>(null)

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
    <div
      className="grid min-h-0 gap-4 overflow-y-auto pr-1"
      aria-live="polite"
      ref={messagesContainerRef}
    >
      {messages.map((message, index) => (
        <div
          ref={message.id === focusedMessageId ? focusedMessageRef : null}
          className={
            message.role === 'user'
              ? 'flex flex-row-reverse items-start gap-2.5'
              : 'flex items-start gap-2.5'
          }
          key={`${message.role}-${index}`}
          tabIndex={message.id === focusedMessageId ? -1 : undefined}
        >
          <div
            className={
              message.role === 'user'
                ? 'grid size-7 shrink-0 place-items-center rounded-full bg-capa-muted text-txt-muted'
                : 'grid size-7 shrink-0 place-items-center rounded-full bg-brand-light text-brand-primary'
            }
          >
            {message.role === 'assistant' ? <Sparkles size={15} /> : <UserRound size={15} />}
          </div>

          <div
            className={
              message.role === 'user'
                ? 'min-w-0 max-w-[min(83%,590px)] rounded-2xl rounded-tr-[5px] bg-brand-primary px-4 py-3.5 text-[0.9375rem] leading-[1.55] text-brand-text wrap-anywhere md:max-w-[min(76%,590px)]'
                : 'min-w-0 max-w-[min(83%,590px)] rounded-2xl rounded-tl-[5px] bg-capa-muted px-4 py-3.5 text-[0.9375rem] leading-[1.55] text-txt-medium wrap-anywhere md:max-w-[min(76%,590px)]'
            }
          >
            {message.role === 'assistant' ? (
              <MarkdownMessage content={message.content} />
            ) : (
              <p className="m-0 text-pretty">{message.content}</p>
            )}

            {message.references &&
              message.references.length > 0 &&
              message.chunks &&
              message.chunks.length > 0 && (
                <div className="mt-3.25 border-t border-borde-light pt-2.5">
                  <p className="m-0 mb-1.75 flex items-center gap-1.5 text-xs font-bold text-txt-muted">
                    <FileText size={14} />
                    Fuentes consultadas
                  </p>

                  {message.references.map((reference, refIndex) => {
                    const chunk = message.chunks?.[refIndex] ?? null

                    return (
                      <button
                        key={`${reference}-${refIndex}`}
                        type="button"
                        className="block min-w-0 py-1 text-left text-xs text-txt-muted transition-colors hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-60 wrap-anywhere"
                        disabled={!chunk}
                        onClick={() => chunk && setActiveReference({ label: reference, chunk })}
                      >
                        <span className="mr-1.75 inline-grid size-4.25 place-items-center rounded-full bg-brand-primary text-brand-text">
                          {refIndex + 1}
                        </span>
                        {reference}
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
        <div className="flex items-start gap-2.5">
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-light text-brand-primary">
            <Sparkles size={15} />
          </div>

          <span className="sr-only">NormIA está preparando la respuesta.</span>

          <div
            className="flex gap-1 rounded-2xl rounded-tl-[5px] bg-capa-muted p-4.5"
            aria-hidden="true"
          >
            <span className="size-1.25 animate-bounce rounded-full bg-txt-subtle" />
            <span className="size-1.25 animate-bounce rounded-full bg-txt-subtle [animation-delay:150ms]" />
            <span className="size-1.25 animate-bounce rounded-full bg-txt-subtle [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </div>
  )
}

