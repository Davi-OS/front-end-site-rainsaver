import type { User } from './user'
import type { Address } from './address'
import type { Station } from './station'
import type { PluvialCalculation } from './pluvial'

export interface Db {
  users: User[]
  addresses: Address[]
  stations: Station[]
  calculations: PluvialCalculation[]
}

export interface Session {
  userId: string
}
