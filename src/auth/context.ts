import { createContext } from 'react'
import type { LoginInput, PublicUser, RegisterInput, UpdateProfileInput } from '@/types'

export interface AuthContextValue {
  user: PublicUser | null
  isAuthenticated: boolean
  login: (input: LoginInput) => PublicUser
  register: (input: RegisterInput) => PublicUser
  logout: () => void
  refreshUser: () => void
  updateProfile: (input: UpdateProfileInput) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
