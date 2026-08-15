import type { Address, AddressInput } from '@/types'
import { readDb, writeDb } from './storage'

export function listAddressesByUser(userId: string): Address[] {
  const db = readDb()
  return db.addresses.filter((a) => a.userId === userId)
}

export function findAddressById(id: string): Address | undefined {
  const db = readDb()
  return db.addresses.find((a) => a.id === id)
}

export function createAddress(userId: string, input: AddressInput): Address {
  const db = readDb()
  const address: Address = {
    id: crypto.randomUUID(),
    userId,
    ...input,
  }
  db.addresses.push(address)
  writeDb(db)
  return address
}

export function updateAddress(id: string, input: AddressInput): Address {
  const db = readDb()
  const address = db.addresses.find((a) => a.id === id)
  if (!address) {
    throw new Error('Endereço não encontrado.')
  }
  Object.assign(address, input)
  writeDb(db)
  return address
}

export function deleteAddress(id: string): void {
  const db = readDb()
  db.addresses = db.addresses.filter((a) => a.id !== id)
  writeDb(db)
}
