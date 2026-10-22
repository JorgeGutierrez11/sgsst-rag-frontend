export async function parseApiError(response: Response): Promise<string> {
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

export async function requestJson<T>(
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
