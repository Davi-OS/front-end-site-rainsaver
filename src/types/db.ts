import type { Address } from './address'
import type { Station } from './station'
import type { PluvialCalculation } from './pluvial'

// Mocked data still kept in localStorage until it moves to the rain-saver
// backend. Accounts and sessions live in go-auth-service.
export interface Db {
  addresses: Address[]
  stations: Station[]
  calculations: PluvialCalculation[]
}
