import type { Db } from '@/types'
import { createInitialDb } from './seed'

const DB_KEY = 'rainsaver:db:v1'

export function readDb(): Db {
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const initial = createInitialDb()
    writeDb(initial)
    return initial
  }
  try {
    return JSON.parse(raw) as Db
  } catch {
    const initial = createInitialDb()
    writeDb(initial)
    return initial
  }
}

export function writeDb(db: Db): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}
