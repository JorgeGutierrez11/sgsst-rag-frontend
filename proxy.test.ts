import { NextRequest } from 'next/server'
import { getRewrittenUrl, isRewrite, unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { describe, expect, it, vi } from 'vitest'
import { BACKEND_NOT_CONFIGURED_MESSAGE, config, proxy } from '@/proxy'

describe('proxy', () => {
  it('rewrites API requests to the backend read from SGSST_API_URL, keeping path and query', () => {
    vi.stubEnv('SGSST_API_URL', 'http://backend.test:8000')

    const response = proxy(new NextRequest('http://localhost:3000/api/v1/query?trace=1'))

    expect(isRewrite(response)).toBe(true)
    expect(getRewrittenUrl(response)).toBe('http://backend.test:8000/api/v1/query?trace=1')
  })

  it('reads SGSST_API_URL on every request instead of at build time', () => {
    vi.stubEnv('SGSST_API_URL', 'http://first.test')
    expect(getRewrittenUrl(proxy(new NextRequest('http://localhost/api/v1/diagnostics')))).toBe(
      'http://first.test/api/v1/diagnostics',
    )

    vi.stubEnv('SGSST_API_URL', 'http://second.test')
    expect(getRewrittenUrl(proxy(new NextRequest('http://localhost/api/v1/diagnostics')))).toBe(
      'http://second.test/api/v1/diagnostics',
    )
  })

  it('keeps a base path and ignores a trailing slash in SGSST_API_URL', () => {
    vi.stubEnv('SGSST_API_URL', 'https://gateway.test/sgsst/')

    const response = proxy(new NextRequest('http://localhost/api/v1/diagnostics/diag-1/report'))

    expect(getRewrittenUrl(response)).toBe('https://gateway.test/sgsst/api/v1/diagnostics/diag-1/report')
  })

  it.each([
    ['missing', undefined],
    ['invalid', 'not a url'],
  ])('responds 503 with a detail message when SGSST_API_URL is %s', async (_case, value) => {
    vi.stubEnv('SGSST_API_URL', value)

    const response = proxy(new NextRequest('http://localhost/api/v1/query', { method: 'POST' }))

    expect(isRewrite(response)).toBe(false)
    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({ detail: BACKEND_NOT_CONFIGURED_MESSAGE })
  })

  it('refuses to forward a path that resolves outside /api/v1/', async () => {
    vi.stubEnv('SGSST_API_URL', 'http://backend.test')

    const response = proxy(new NextRequest('http://localhost/api/v1/%2e%2e/%2e%2e/admin'))

    expect(isRewrite(response)).toBe(false)
    expect(response.status).toBe(404)
  })

  it('only runs for backend API routes', () => {
    expect(unstable_doesMiddlewareMatch({ config, url: '/api/v1/query' })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, url: '/api/v1/diagnostics/diag-1/answers' })).toBe(true)
    expect(unstable_doesMiddlewareMatch({ config, url: '/api/health' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: '/consulta' })).toBe(false)
    expect(unstable_doesMiddlewareMatch({ config, url: '/' })).toBe(false)
  })
})
