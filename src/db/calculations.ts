import type { PluvialCalculation } from '@/types'
import { readDb, writeDb } from './storage'

export function listCalculationsByUser(userId: string): PluvialCalculation[] {
  const db = readDb()
  return db.calculations.filter((c) => c.userId === userId)
}

export function saveCalculation(calculation: Omit<PluvialCalculation, 'id' | 'createdAt'>): PluvialCalculation {
  const db = readDb()
  const record: PluvialCalculation = {
    ...calculation,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  db.calculations.push(record)
  writeDb(db)
  return record
}
