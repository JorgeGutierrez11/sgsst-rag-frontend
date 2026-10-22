import { describe, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('responds ok without depending on the backend configuration', async () => {
    vi.stubEnv('SGSST_API_URL', undefined)

    const response = GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })
})
