import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConsultationQueryResponse } from '@/features/consultation/model/consultation.types'

const validResponse: ConsultationQueryResponse = {
  answer: 'Debes contar con un responsable del SG-SST.',
  references: ['Resolución 0312 de 2019, art. 3'],
  chunks: ['Artículo 3. Estándares mínimos para empresas de diez o menos trabajadores...'],
  conversation_id: 'conversation-1',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function loadClient() {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SGSST_API_URL', 'http://legacy-public-url.test')
  return import('@/features/consultation/api/consultation-api')
}

describe('queryConsultation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('posts the question to the query endpoint and returns the answer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(validResponse))
    vi.stubGlobal('fetch', fetchMock)
    const { queryConsultation } = await loadClient()

    const result = await queryConsultation({ question: '¿Qué exige la norma?', conversation_id: 'conversation-1' })

    expect(result).toEqual(validResponse)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/query')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({ question: '¿Qué exige la norma?', conversation_id: 'conversation-1' })
  })

  it('rejects a response without chunks', async () => {
    const withoutChunks = { ...validResponse, chunks: undefined }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(withoutChunks)))
    const { queryConsultation } = await loadClient()

    await expect(
      queryConsultation({ question: 'Pregunta', conversation_id: 'conversation-1' }),
    ).rejects.toThrow('La API normativa devolvió una respuesta inválida.')
  })

  it('throws when the API responds with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'Servicio no disponible' }, 503)))
    const { queryConsultation } = await loadClient()

    await expect(
      queryConsultation({ question: 'Pregunta', conversation_id: 'conversation-1' }),
    ).rejects.toThrow()
  })

  it('does not log the API URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(validResponse)))
    await loadClient()

    expect(console.log).not.toHaveBeenCalled()
  })
})
