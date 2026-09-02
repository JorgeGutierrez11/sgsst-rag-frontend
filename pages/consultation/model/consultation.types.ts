export type ConsultationMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: string[]
  chunks?: string[]
}

export type ConsultationQueryRequest = {
  question: string
  conversation_id: string
}

export type ConsultationQueryResponse = {
  answer: string
  references: string[]
  chunks: string[]
  conversation_id: string
}
