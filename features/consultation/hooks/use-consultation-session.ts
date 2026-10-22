import { queryConsultation } from "../api/consultation-api"
import { useAgentSessionStore } from "@/shared/stores/agent-consultation.store"

const CONSULTATION_API_ERROR =
    'No pudimos obtener una respuesta de la API. Intenta nuevamente cuando el servicio esté disponible.'

export function useConsultationSession() {
    const messages = useAgentSessionStore((state) => state.messages)
    const input = useAgentSessionStore((state) => state.input)
    const loading = useAgentSessionStore((state) => state.loading)
    const error = useAgentSessionStore((state) => state.error)
    const conversationId = useAgentSessionStore((state) => state.conversationId)
    const focusedMessageId = useAgentSessionStore((state) => state.focusedMessageId)

    const setInput = useAgentSessionStore((state) => state.setInput)
    const startUserMessage = useAgentSessionStore((state) => state.startUserMessage)
    const finishAssistantMessage = useAgentSessionStore((state) => state.finishAssistantMessage)
    const failMessage = useAgentSessionStore((state) => state.failMessage)
    const finishLoading = useAgentSessionStore((state) => state.finishLoading)
    const clearSession = useAgentSessionStore((state) => state.clearSession)

    const send = async (text = input) => {
        const question = text.trim()

        if (!question || loading) return

        startUserMessage(question)

        try {
            const response = await queryConsultation({
                question,
                conversation_id: conversationId,
            })

            finishAssistantMessage(response)
        } catch {
            failMessage(CONSULTATION_API_ERROR)
        } finally {
            finishLoading()
        }
    }

    return {
        messages,
        input,
        loading,
        error,
        focusedMessageId,
        setInput,
        send,
        clearSession,
    }
}
