export type ConsultationMessage = {
  role: 'user' | 'assistant'
  content: string
  references?: string[]
}
