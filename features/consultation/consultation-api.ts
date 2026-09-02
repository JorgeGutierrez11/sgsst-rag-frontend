import type { ConsultationQueryRequest, ConsultationQueryResponse } from '@/features/consultation/consultation.types'

const CONSULTATION_API_URL = 'http://127.0.0.1:8000/api/v1/query'

export async function queryConsultation(request: ConsultationQueryRequest): Promise<ConsultationQueryResponse> {
  const response = await fetch(CONSULTATION_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('No se pudo consultar la API normativa.')
  }

  const data = await response.json()

  if (!isConsultationQueryResponse(data)) {
    throw new Error('La API normativa devolvió una respuesta inválida.')
  }

  return data
}

function isConsultationQueryResponse(value: unknown): value is ConsultationQueryResponse {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.answer === 'string' &&
    Array.isArray(candidate.references) &&
    candidate.references.every((reference) => typeof reference === 'string') &&
    typeof candidate.conversation_id === 'string'
  )
}
