import type { ConsultationQueryRequest, ConsultationQueryResponse } from '@/features/consultation/model/consultation.types'
import { requestJson } from '@/shared/api/http-client'

const CONSULTATION_API_URL = '/api/v1/query'

export async function queryConsultation(request: ConsultationQueryRequest): Promise<ConsultationQueryResponse> {
  const data = await requestJson<unknown>(CONSULTATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!isConsultationQueryResponse(data)) {
    throw new Error('La API normativa devolvió una respuesta inválida.')
  }

  return data
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isConsultationQueryResponse(value: unknown): value is ConsultationQueryResponse {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.answer === 'string' &&
    isStringArray(candidate.references) &&
    isStringArray(candidate.chunks) &&
    typeof candidate.conversation_id === 'string'
  )
}
