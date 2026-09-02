export type ConsultationMessage = {
  role: 'user' | 'assistant'
  content: string
  references?: string[]
}

export type ConsultationQueryRequest = {
  question: string
  conversation_id: string
}

export type ConsultationQueryResponse = {
  answer: string
  references: string[]
  conversation_id: string
}
