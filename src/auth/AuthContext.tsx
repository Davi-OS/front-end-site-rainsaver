import { useEffect, useState, type ReactNode } from 'react'
import type { PublicUser } from '@/types'
import * as authApi from '@/api/auth'
import { authorized, onSessionExpired } from '@/api/session'
import { clearTokens, decodeClaims, readTokens, TOKENS_KEY, writeTokens, type TokenPair } from '@/api/tokens'
import { AuthContext, type AuthContextValue, type AuthStatus } from './context'
import { NoAccessError } from './errors'

interface State {
  status: AuthStatus
  user: PublicUser | null
  notice: string | null
}

const ANONYMOUS: State = { status: 'anonymous', user: null, notice: null }
const anonymousWith = (notice: string): State => ({ ...ANONYMOUS, notice })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => (readTokens() ? { status: 'loading', user: null, notice: null } : ANONYMOUS))

  useEffect(() => {
    let cancelled = false
    if (readTokens()) {
      authorized(authApi.me)
        .then((user) => !cancelled && setState({ status: 'authenticated', user, notice: null }))
        // Expired session (tokens already cleared, onSessionExpired already
        // set its notice: keep it) or backend unreachable: either way the
        // user has to log in.
        .catch(() => !cancelled && setState((s) => (s.status === 'anonymous' ? s : ANONYMOUS)))
    }

    const unsubscribe = onSessionExpired(() => setState(anonymousWith('Sua sessão expirou. Entre novamente.')))
    // Logging out in another tab clears the shared tokens.
    const onStorage = (event: StorageEvent) => {
      if (event.key === TOKENS_KEY && event.newValue === null) setState(ANONYMOUS)
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelled = true
      unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const startSession = async (tokens: TokenPair) => {
    // A valid account without membership gets a token with no org: it can't
    // use RainSaver, so don't start a session with it.
    if (!decodeClaims(tokens.accessToken)?.org) {
      await authApi.logout(tokens).catch(() => undefined)
      throw new NoAccessError()
    }
    writeTokens(tokens)
    const user = await authApi.me(tokens.accessToken)
    setState({ status: 'authenticated', user, notice: null })
    return user
  }

  const login: AuthContextValue['login'] = async ({ email, password, org }) =>
    startSession(await authApi.login(email, password, org))

  const signup: AuthContextValue['signup'] = async (email, password) =>
    startSession(await authApi.signup(email, password))

  const logout = async () => {
    const tokens = readTokens()
    clearTokens()
    setState(ANONYMOUS)
    // Best effort: revokes the refresh token server-side. The local session
    // is already gone even if this fails.
    if (tokens) await authApi.logout(tokens).catch(() => undefined)
  }

  const changePassword: AuthContextValue['changePassword'] = async (currentPassword, newPassword) => {
    await authorized((token) => authApi.changePassword(token, currentPassword, newPassword))
    // Every session (this one included) was invalidated server-side; the
    // route guard sends the user to /login, which shows the notice.
    clearTokens()
    setState(anonymousWith('Senha alterada. Entre novamente com a nova senha.'))
  }

  return (
    <AuthContext.Provider
      value={{ ...state, isAuthenticated: state.status === 'authenticated', login, signup, logout, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  )
}
