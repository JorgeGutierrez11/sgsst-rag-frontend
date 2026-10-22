import { describe, expect, it, vi } from 'vitest'
import { parseApiError, requestJson } from '@/shared/api/http-client'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('requestJson', () => {
  it('returns the parsed body and disables the fetch cache', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await requestJson<{ ok: boolean }>('http://api.test/items', { method: 'GET' })

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/items', {
      method: 'GET',
      cache: 'no-store',
    })
  })

  it('throws the API detail message when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ detail: 'Revisión desactualizada' }, 409)))

    await expect(requestJson('http://api.test/items', { method: 'POST' })).rejects.toThrow(
      'Revisión desactualizada',
    )
  })
})

describe('parseApiError', () => {
  it('falls back to the HTTP status when the body is not JSON', async () => {
    const response = new Response('<html>Bad gateway</html>', { status: 502 })

    await expect(parseApiError(response)).resolves.toBe('Error HTTP 502')
  })
})
