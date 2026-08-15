import type { Db, Session } from '@/types'
import { createInitialDb } from './seed'

const DB_KEY = 'rainsaver:db:v1'
const SESSION_KEY = 'rainsaver:session:v1'

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

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function setSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}
