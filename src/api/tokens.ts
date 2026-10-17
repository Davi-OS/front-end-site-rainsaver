export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/** Claims the front-end reads from the access token (never trusted for security: the backends verify it). */
export interface AccessClaims {
  sub: string
  org?: string
  roles?: string[]
  perms?: string[]
  exp: number
}

export const TOKENS_KEY = 'rainsaver:tokens:v1'

// localStorage keeps the session across reloads and tabs. Trade-off: tokens
// are readable by any script on the page (XSS). An httpOnly refresh cookie
// would avoid that but needs cookie support in go-auth-service.
export function readTokens(): TokenPair | null {
  const raw = localStorage.getItem(TOKENS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<TokenPair>
    return parsed.accessToken && parsed.refreshToken ? (parsed as TokenPair) : null
  } catch {
    return null
  }
}

export function writeTokens(tokens: TokenPair): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_KEY)
}

export function decodeClaims(accessToken: string): AccessClaims | null {
  const payload = accessToken.split('.')[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')
    return JSON.parse(atob(base64)) as AccessClaims
  } catch {
    return null
  }
}

/** True when the token is expired or will be within marginMs (or can't be decoded). */
export function expiresWithin(accessToken: string, marginMs: number): boolean {
  const claims = decodeClaims(accessToken)
  if (!claims?.exp) return true
  return claims.exp * 1000 - Date.now() <= marginMs
}
