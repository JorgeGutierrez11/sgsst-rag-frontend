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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    messagesContainer.scrollTo({
      top: messagesContainer.scrollTop + messageBounds.top - containerBounds.top,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
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
                ? 'grid size-7 shrink-0 place-items-center rounded-full bg-capa-main text-txt-muted shadow-sm'
                : 'grid size-7 shrink-0 place-items-center rounded-full bg-brand-light text-brand-primary shadow-sm'
            }
          >
            {message.role === 'assistant' ? <Sparkles size={15} aria-hidden="true" /> : <UserRound size={15} aria-hidden="true" />}
          </div>

          <div
            className={
              message.role === 'user'
                ? 'min-w-0 max-w-[min(86%,620px)] rounded-[22px] rounded-tr-md bg-brand-primary px-4 py-3.5 text-sm leading-6 text-brand-text shadow-sm wrap-anywhere md:max-w-[min(72%,620px)]'
                : 'min-w-0 max-w-[min(88%,680px)] rounded-[22px] rounded-tl-md border border-white/70 bg-capa-surface px-4 py-3.5 text-sm leading-6 text-txt-medium shadow-sm wrap-anywhere md:max-w-[min(78%,680px)]'
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
                    <FileText size={14} aria-hidden="true" />
                    Fuentes consultadas
                  </p>
                  {message.references.map((reference, refIndex) => {
                    const chunk = message.chunks?.[refIndex] ?? null
                    return (
                      <button
                        key={`${reference}-${refIndex}`}
                        type="button"
                        className="mt-1 inline-flex max-w-full items-center gap-2 rounded-[5px] border border-borde-light bg-capa-main p-px pl-1.5 text-left text-[11px] font-medium text-txt-muted transition-[border-color,color] hover:border-brand-primary/40 hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-60 wrap-anywhere"
                        disabled={!chunk}
                        onClick={() => chunk && setActiveReference({ label: reference, chunk })}
                      >
                        <span className="inline-flex size-4.25 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[10px] leading-none text-brand-text">
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
          <div className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-light text-brand-primary shadow-sm">
            <Sparkles size={15} aria-hidden="true" />
          </div>

          <span className="sr-only">NormIA está preparando la respuesta.</span>

          <div
            className="flex gap-1 rounded-[22px] rounded-tl-md border border-white/70 bg-capa-surface p-4.5 shadow-sm"
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
