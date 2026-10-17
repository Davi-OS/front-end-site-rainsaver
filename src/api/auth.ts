import { AUTH_API_URL, AUTH_SYSTEM } from '@/config'
import type { PublicUser } from '@/types'
import { ApiError, requestJSON } from './http'
import type { TokenPair } from './tokens'

interface TokenPairResponse {
  access_token: string
  refresh_token: string
}

export interface OrgChoice {
  id: string
  name: string
  slug: string
}

/** The user belongs to several organizations: login must be retried with one of them. */
export class OrgRequiredError extends Error {
  readonly orgs: OrgChoice[]

  constructor(orgs: OrgChoice[]) {
    super('Escolha a organização.')
    this.name = 'OrgRequiredError'
    this.orgs = orgs
  }
}

const toPair = (r: TokenPairResponse): TokenPair => ({ accessToken: r.access_token, refreshToken: r.refresh_token })

export async function login(email: string, password: string, org?: string): Promise<TokenPair> {
  try {
    const body = { email, password, system: AUTH_SYSTEM, ...(org ? { org } : {}) }
    return toPair(await requestJSON<TokenPairResponse>(`${AUTH_API_URL}/login`, { method: 'POST', body }))
  } catch (err) {
    const data = err instanceof ApiError ? (err.body as { error?: string; orgs?: OrgChoice[] } | undefined) : undefined
    if (err instanceof ApiError && err.status === 409 && data?.error === 'org_required') {
      throw new OrgRequiredError(data.orgs ?? [])
    }
    throw err
  }
}

export async function refresh(refreshToken: string): Promise<TokenPair> {
  return toPair(
    await requestJSON<TokenPairResponse>(`${AUTH_API_URL}/refresh`, {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }),
  )
}

export async function logout(tokens: TokenPair): Promise<void> {
  await requestJSON<void>(`${AUTH_API_URL}/logout`, {
    method: 'POST',
    token: tokens.accessToken,
    body: { system: AUTH_SYSTEM, refresh_token: tokens.refreshToken },
  })
}

export async function me(accessToken: string): Promise<PublicUser> {
  const user = await requestJSON<{ id: string; email: string }>(`${AUTH_API_URL}/me`, { token: accessToken })
  return { id: user.id, email: user.email }
}

export async function changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<void> {
  await requestJSON<void>(`${AUTH_API_URL}/me/password`, {
    method: 'POST',
    token: accessToken,
    body: { current_password: currentPassword, new_password: newPassword },
  })
}
