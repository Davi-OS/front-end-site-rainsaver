import { createContext } from 'react'
import type { LoginInput, PublicUser } from '@/types'

/** loading: a stored session is being validated (GET /me) on startup. */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: PublicUser | null
  status: AuthStatus
  isAuthenticated: boolean
  /** Why the last session ended (password changed, session expired), for the login page. */
  notice: string | null
  login: (input: LoginInput) => Promise<PublicUser>
  logout: () => Promise<void>
  /** Changes the password; every session ends, so the user is logged out. */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
