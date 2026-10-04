import { useState } from "react";
import { ConsultationMessage, ConsultationQueryResponse } from "../../features/consultation/model/consultation.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConsultationSessionState = {
    messages: ConsultationMessage[]
    input: string
    loading: boolean
    error: string
    conversationId: string
    focusedMessageId: string | null

    setInput: (input: string) => void
    startUserMessage: (question: string) => string
    finishAssistantMessage: (response: ConsultationQueryResponse) => void
    failMessage: (message: string) => void
    finishLoading: () => void
    clearSession: () => void
}

const createInitialState = () => ({
    messages: [],
    input: '',
    loading: false,
    error: '',
    conversationId: crypto.randomUUID(),
    focusedMessageId: null,
})

export const useAgentSessionStore = create<ConsultationSessionState>()((set) => ({
    ...createInitialState(),
    setInput: (input) => set({ input }),

    startUserMessage: (question) => {
        const userMessageId = crypto.randomUUID()

        set((state) => ({
            input: '',
            error: '',
            loading: true,
            focusedMessageId: userMessageId,
            messages: [
                ...state.messages,
                {
                    id: userMessageId,
                    role: 'user',
                    content: question
                }
            ]
        }))
        return userMessageId
    },
    finishAssistantMessage(response) {
        set((state) => ({
            conversationId: response.conversation_id,

            messages: [
                ...state.messages,
                {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.answer,
                    references: response.references,
                    chunks: response.chunks,
                },
            ]
        }))
    },
    failMessage: (message) => set({ error: message }),

    finishLoading: () => set({ loading: false }),

    clearSession: () => set(createInitialState()),
}))