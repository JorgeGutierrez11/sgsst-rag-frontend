import { NextResponse, type NextRequest } from 'next/server'

const BACKEND_API_PREFIX = '/api/v1/'

export const BACKEND_NOT_CONFIGURED_MESSAGE =
  'El servicio normativo no está disponible: falta configurar la conexión con el backend.'

// SGSST_API_URL is read on every request so one build can target any backend.
function resolveBackendUrl(request: NextRequest): URL | null {
  const backendUrl = process.env.SGSST_API_URL?.trim()

  if (!backendUrl) return null

  const { pathname, search } = request.nextUrl

  try {
    return new URL(`${backendUrl.replace(/\/+$/, '')}${pathname}${search}`)
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  // Defense in depth: never forward a normalized path outside the backend API prefix.
  if (!request.nextUrl.pathname.startsWith(BACKEND_API_PREFIX)) {
    return NextResponse.json({ detail: 'Ruta no encontrada.' }, { status: 404 })
  }

  const destination = resolveBackendUrl(request)

  if (!destination) {
    return NextResponse.json({ detail: BACKEND_NOT_CONFIGURED_MESSAGE }, { status: 503 })
  }

  return NextResponse.rewrite(destination)
}

export const config = {
  matcher: '/api/v1/:path*',
}
