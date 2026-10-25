/** An HTTP error response from one of the backends ({"error": "..."} bodies). */
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** The request never got a response (server down, CORS refusal, offline). */
export class NetworkError extends Error {
  constructor() {
    super('Não foi possível conectar ao servidor.')
    this.name = 'NetworkError'
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string
}

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export async function requestJSON<T>(url: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new NetworkError()
  }

  const text = await response.text()
  const data = text ? parseJSON(text) : undefined
  if (!response.ok) {
    const message = (data as { error?: unknown } | undefined)?.error
    throw new ApiError(response.status, typeof message === 'string' ? message : response.statusText, data)
  }
  return data as T
}
