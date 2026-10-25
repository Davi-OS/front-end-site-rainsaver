import { ApiError } from './http'
import * as authApi from './auth'
import { clearTokens, expiresWithin, readTokens, writeTokens } from './tokens'

/** The session can no longer be renewed: the user must log in again. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Sua sessão expirou. Entre novamente.')
    this.name = 'SessionExpiredError'
  }
}

// Renew a bit before expiry so requests don't race the 15-minute TTL.
const EXPIRY_MARGIN_MS = 30_000

const expiredListeners = new Set<() => void>()

/** Subscribe to forced logouts (refresh failed); returns the unsubscribe function. */
export function onSessionExpired(listener: () => void): () => void {
  expiredListeners.add(listener)
  return () => expiredListeners.delete(listener)
}

function expireSession(): never {
  clearTokens()
  expiredListeners.forEach((listener) => listener())
  throw new SessionExpiredError()
}

let inflightRefresh: Promise<string> | null = null

/**
 * Exchanges the refresh token for a new pair. Concurrent callers share one
 * request: refresh tokens rotate, so two parallel refreshes would make the
 * second one fail and log the user out.
 */
function refreshAccessToken(): Promise<string> {
  inflightRefresh ??= (async () => {
    const tokens = readTokens()
    if (!tokens) expireSession()
    try {
      const pair = await authApi.refresh(tokens.refreshToken)
      writeTokens(pair)
      return pair.accessToken
    } catch (err) {
      if (!(err instanceof ApiError) || (err.status !== 401 && err.status !== 403)) throw err
      // Another tab may have rotated the refresh token meanwhile: use its result.
      const current = readTokens()
      if (current && current.refreshToken !== tokens.refreshToken) return current.accessToken
      return expireSession()
    }
  })().finally(() => {
    inflightRefresh = null
  })
  return inflightRefresh
}

async function validAccessToken(): Promise<string> {
  const tokens = readTokens()
  if (!tokens) expireSession()
  return expiresWithin(tokens.accessToken, EXPIRY_MARGIN_MS) ? refreshAccessToken() : tokens.accessToken
}

/**
 * Runs call with a valid access token. On a 401 (token revoked or expired
 * server-side) it refreshes once and retries; if that fails too, the session
 * is expired and SessionExpiredError is thrown.
 */
export async function authorized<T>(call: (accessToken: string) => Promise<T>): Promise<T> {
  const token = await validAccessToken()
  try {
    return await call(token)
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) throw err
  }
  const fresh = await refreshAccessToken()
  try {
    return await call(fresh)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) expireSession()
    throw err
  }
}
