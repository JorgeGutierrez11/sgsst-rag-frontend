import { beforeEach, describe, expect, it } from 'vitest'
import { useAgentSessionStore } from '@/shared/stores/agent-consultation.store'

const response = {
  answer: 'Debes contar con un responsable del SG-SST.',
  references: ['Resolución 0312 de 2019, art. 3'],
  chunks: ['Artículo 3...'],
  conversation_id: 'conversation-1',
}

function startConversationWithError() {
  const store = useAgentSessionStore.getState()
  store.startUserMessage('¿Qué exige la norma?')
  store.finishAssistantMessage(response)
  store.finishLoading()
  store.setInput('borrador')
  store.failMessage('Error de la API')
}

describe('agent consultation store', () => {
  beforeEach(() => {
    useAgentSessionStore.getState().clearSession()
  })

  it('clearSession resets the conversation as a page reload would', () => {
    startConversationWithError()

    useAgentSessionStore.getState().clearSession()

    const state = useAgentSessionStore.getState()
    expect(state.messages).toEqual([])
    expect(state.input).toBe('')
    expect(state.error).toBe('')
    expect(state.loading).toBe(false)
    expect(state.focusedMessageId).toBeNull()
    expect(state.conversationId).not.toBe('conversation-1')
    expect(state.conversationId).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('clearError removes only the error and keeps the conversation', () => {
    startConversationWithError()
    const before = useAgentSessionStore.getState()

    useAgentSessionStore.getState().clearError()

    const state = useAgentSessionStore.getState()
    expect(state.error).toBe('')
    expect(state.messages).toEqual(before.messages)
    expect(state.messages).toHaveLength(2)
    expect(state.input).toBe('borrador')
    expect(state.conversationId).toBe('conversation-1')
    expect(state.focusedMessageId).toBe(before.focusedMessageId)
  })
})
