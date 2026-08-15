import type { PublicUser, RegisterInput, UpdateProfileInput, User } from '@/types'
import { readDb, writeDb } from './storage'
import { createAddress } from './addresses'

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

export function findUserByEmail(email: string): User | undefined {
  const db = readDb()
  const normalized = email.trim().toLowerCase()
  return db.users.find((u) => u.email.toLowerCase() === normalized)
}

export function findUserById(id: string): User | undefined {
  const db = readDb()
  return db.users.find((u) => u.id === id)
}

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('Este email já está cadastrado.')
  }
}

export function createUser(input: RegisterInput): User {
  if (findUserByEmail(input.email)) {
    throw new EmailAlreadyRegisteredError()
  }

  const db = readDb()
  const user: User = {
    id: crypto.randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    gender: input.gender,
    email: input.email.trim(),
    password: input.password,
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  writeDb(db)

  createAddress(user.id, input.address)

  return user
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email ou senha inválidos.')
  }
}

export function verifyCredentials(email: string, password: string): User {
  const user = findUserByEmail(email)
  if (!user || user.password !== password) {
    throw new InvalidCredentialsError()
  }
  return user
}

export function updateUserProfile(userId: string, input: UpdateProfileInput): User {
  const db = readDb()
  const user = db.users.find((u) => u.id === userId)
  if (!user) {
    throw new Error('Usuário não encontrado.')
  }
  user.firstName = input.firstName
  user.lastName = input.lastName
  writeDb(db)
  return user
}
