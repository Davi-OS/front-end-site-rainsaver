import { SUBSCRIBER_PERMISSION } from '@/config'
import { decodeClaims, readTokens } from '@/api/tokens'

/**
 * True when the current access token carries the subscriber permission. This
 * is the real source of truth once the auth service issues it. Client-side
 * only, so it is for UX (hiding ads), never for authorizing anything.
 */
export function tokenSaysSubscriber(): boolean {
  const tokens = readTokens()
  if (!tokens) return false
  return decodeClaims(tokens.accessToken)?.perms?.includes(SUBSCRIBER_PERMISSION) ?? false
}
