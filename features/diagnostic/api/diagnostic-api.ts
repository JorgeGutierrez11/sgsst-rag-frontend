import type {
  CompleteDiagnosticResponse,
  CreateDiagnosticRequest,
  CreateDiagnosticResponse,
  SubmitDiagnosticAnswerRequest,
  SubmitDiagnosticAnswerResponse,
} from '@/features/diagnostic/diagnostic.types'

const DIAGNOSTIC_API_URL =
  process.env.NEXT_PUBLIC_DIAGNOSTIC_API_URL ??
  'http://127.0.0.1:8001/api/v1/diagnostics'

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      detail?: string
    }

    if (body.detail) {
      return body.detail
    }
  } catch {
    // La respuesta no contiene JSON utilizable.
  }

  return `Error HTTP ${response.status}`
}

async function requestJson<T>(
  url: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(
      await parseApiError(response),
    )
  }

  return response.json() as Promise<T>
}

export async function createDiagnostic(
  payload: CreateDiagnosticRequest,
): Promise<CreateDiagnosticResponse> {
  return requestJson<CreateDiagnosticResponse>(
    DIAGNOSTIC_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function submitDiagnosticAnswer(
  diagnosisId: string,
  payload: SubmitDiagnosticAnswerRequest,
): Promise<SubmitDiagnosticAnswerResponse> {
  return requestJson<SubmitDiagnosticAnswerResponse>(
    `${DIAGNOSTIC_API_URL}/${encodeURIComponent(
      diagnosisId,
    )}/answers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )
}

export async function completeDiagnostic(
  diagnosisId: string,
): Promise<CompleteDiagnosticResponse> {
  return requestJson<CompleteDiagnosticResponse>(
    `${DIAGNOSTIC_API_URL}/${encodeURIComponent(
      diagnosisId,
    )}/complete`,
    {
      method: 'POST',
    },
  )
}

export async function getDiagnosticReport(
  diagnosisId: string,
): Promise<Blob> {
  const response = await fetch(
    `${DIAGNOSTIC_API_URL}/${encodeURIComponent(
      diagnosisId,
    )}/report`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(
      await parseApiError(response),
    )
  }

  const contentType =
    response.headers.get('content-type')

  if (
    !contentType?.startsWith(
      'application/pdf',
    )
  ) {
    throw new Error(
      'El servidor no devolvió un informe PDF válido.',
    )
  }

  return response.blob()
}