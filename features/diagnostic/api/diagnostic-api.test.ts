import { describe, expect, it, vi } from 'vitest'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function loadClient() {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SGSST_API_URL', 'http://api.test')
  return import('@/features/diagnostic/api/diagnostic-api')
}

describe('submitDiagnosticAnswer', () => {
  it('encodes the diagnosis id and posts the answer payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ revision: 2 }))
    vi.stubGlobal('fetch', fetchMock)
    const { submitDiagnosticAnswer } = await loadClient()

    const payload = { requirement_id: 'req-1', question_id: 'q-1', answer: true, revision: 1 }
    await submitDiagnosticAnswer('diag/1 a', payload)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://api.test/api/v1/diagnostics/diag%2F1%20a/answers')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual(payload)
  })

  it('propagates the API detail message on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'La revisión no coincide.' }, 409)))
    const { submitDiagnosticAnswer } = await loadClient()

    await expect(
      submitDiagnosticAnswer('diag-1', { requirement_id: 'req-1', question_id: 'q-1', answer: 'sí', revision: 1 }),
    ).rejects.toThrow('La revisión no coincide.')
  })
})

describe('getDiagnosticReport', () => {
  it('returns the PDF blob', async () => {
    const pdf = new Response('%PDF-1.7', { status: 200, headers: { 'Content-Type': 'application/pdf' } })
    const fetchMock = vi.fn().mockResolvedValue(pdf)
    vi.stubGlobal('fetch', fetchMock)
    const { getDiagnosticReport } = await loadClient()

    const blob = await getDiagnosticReport('diag-1')

    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/diagnostics/diag-1/report')
    expect(blob.type).toBe('application/pdf')
    await expect(blob.text()).resolves.toBe('%PDF-1.7')
  })

  it('rejects a report that is not a PDF', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' })))
    const { getDiagnosticReport } = await loadClient()

    await expect(getDiagnosticReport('diag-1')).rejects.toThrow('El servidor no devolvió un informe PDF válido.')
  })

  it('propagates the API detail message on error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'Diagnóstico no encontrado.' }, 404)))
    const { getDiagnosticReport } = await loadClient()

    await expect(getDiagnosticReport('diag-1')).rejects.toThrow('Diagnóstico no encontrado.')
  })
})
