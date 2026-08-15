import { useState, type ReactNode } from 'react'
import type { PublicUser } from '@/types'
import { getSession, setSession } from '@/db/storage'
import { createUser, findUserById, toPublicUser, updateUserProfile, verifyCredentials } from '@/db/users'
import { AuthContext, type AuthContextValue } from './context'

function resolveInitialUser(): PublicUser | null {
  const session = getSession()
  if (!session) return null
  const user = findUserById(session.userId)
  return user ? toPublicUser(user) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(resolveInitialUser)

  const login: AuthContextValue['login'] = (input) => {
    const found = verifyCredentials(input.email, input.password)
    setSession({ userId: found.id })
    const publicUser = toPublicUser(found)
    setUser(publicUser)
    return publicUser
  }

  const register: AuthContextValue['register'] = (input) => {
    const created = createUser(input)
    setSession({ userId: created.id })
    const publicUser = toPublicUser(created)
    setUser(publicUser)
    return publicUser
  }

  const logout = () => {
    setSession(null)
    setUser(null)
  }

  const refreshUser = () => {
    setUser(resolveInitialUser())
  }

  const updateProfile: AuthContextValue['updateProfile'] = (input) => {
    if (!user) return
    const updated = updateUserProfile(user.id, input)
    setUser(toPublicUser(updated))
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, register, logout, refreshUser, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}
