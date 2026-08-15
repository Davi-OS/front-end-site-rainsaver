import type { AddressInput } from './address'

export type Gender = 'Feminino' | 'Masculino' | 'Outros'

export interface User {
  id: string
  firstName: string
  lastName: string
  gender: Gender
  email: string
  password: string
  createdAt: string
}

export type PublicUser = Omit<User, 'password'>

export interface UpdateProfileInput {
  firstName: string
  lastName: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  firstName: string
  lastName: string
  gender: Gender
  email: string
  password: string
  confirmPassword: string
  address: AddressInput
}
