'use client'

import { useState } from 'react'
import { ArrowUp, Info, MessageCircle, X } from 'lucide-react'
import { queryConsultation } from '@/features/consultation/api/consultation-api'
import { ConsultationComposer } from '@/features/consultation/components/consultation-composer'
import type { ConsultationMessage } from '@/features/consultation/model/consultation.types'
import { consultationExamples } from '@/features/consultation/model/examples'
import { MessageList } from '@/features/consultation/components/message-list'
import { useConsultationSession } from '@/features/consultation/hooks/use-consultation-session'

export function ConsultationView() {
  const {
    messages,
    input,
    loading,
    error,
    focusedMessageId,
    setInput,
    send,
    clearSession
  } = useConsultationSession()

  return (
    <section className="mx-auto grid h-[calc(100dvh-var(--bottom-nav-height)-env(safe-area-inset-bottom)-24px)] min-h-0 w-full grid-rows-[minmax(0,1fr)_auto] px-[clamp(16px,5vw,86px)] pt-0 pb-(--mobile-page-y) md:h-[calc(100dvh-32px)] md:max-w-230 md:pb-(--desktop-page-y)">
      <div className="min-h-0 overflow-hidden">
        <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(12px,2vh,18px)] pt-(--mobile-page-y) md:pt-(--desktop-page-y)">
          {messages.length > 0 && (
            <div className="flex items-center gap-3.25">
              <div className="grid size-11 place-items-center rounded-[13px] bg-brand-light text-brand-primary shadow-soft">
                <MessageCircle size={22} />
              </div>

              <div>
                <p className="m-0 mb-1.25 text-xs font-bold uppercase tracking-[0.08em] text-txt-muted">
                  Consulta normativa
                </p>

                <h1 className="m-0 text-[23px] tracking-tighter text-balance max-md:text-[22px]">
                  ¿Qué necesitas saber?
                </h1>
              </div>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="relative grid min-h-0 place-items-center overflow-hidden px-2 py-6">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--glow-primary)/0.20),transparent_58%)]"
                aria-hidden="true"
              />
              <div className="relative grid w-full max-w-3xl justify-items-center gap-6 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-brand-light text-brand-primary shadow-glow ring-8 ring-brand-primary/10">
                  <MessageCircle size={28} />
                </div>
                <div className="grid gap-2">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-txt-muted">
                    Consulta normativa
                  </p>
                  <h1 className="m-0 text-balance text-2xl font-extrabold tracking-[-0.04em] text-txt-bold md:text-3xl">
                    ¿Cómo puedo ayudarte hoy?
                  </h1>
                  <p className="mx-auto m-0 max-w-110 text-sm leading-[1.6] text-txt-muted">
                    Haz una pregunta sobre normativa laboral, prevención o gestión de personas.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-1.5 md:flex-row md:flex-wrap md:justify-center">
                  {consultationExamples.map((example) => (
                    <button
                      key={example}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/80 bg-capa-surface px-3 py-1.5 text-left text-[11px] font-semibold text-txt-medium shadow-xs transition-[color,box-shadow,transform] hover:text-brand-dark hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:rounded-full"
                      onClick={() => send(example)}
                      disabled={loading}
                    >
                      <span>{example}</span>
                      <ArrowUp
                        className="shrink-0 rotate-45 text-brand-primary"
                        size={13}
                      />
                    </button>
                  ))}
                </div>
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
            <p
              className="flex items-center gap-1.75 rounded-xl bg-status-error-light px-3 py-2.5 text-xs text-status-error-main"
              role="alert"
            >
              <Info size={15} />

              {error}

              <button
                className="ml-auto text-inherit"
                onClick={() => clearSession()}
                aria-label="Cerrar error"
              >
                <X size={14} />
              </button>
            </p>
          )}
        </div>
      </div>

      <ConsultationComposer
        input={input}
        loading={loading}
        onInputChange={setInput}
        onSend={() => send()}
      />
    </section>
  )
}
