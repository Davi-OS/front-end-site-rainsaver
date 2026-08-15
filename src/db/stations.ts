import type { Station } from '@/types'
import { readDb } from './storage'

export function listStations(): Station[] {
  return readDb().stations
}

export function findStationByEstado(estado: string): Station | undefined {
  const normalized = estado.trim().toUpperCase()
  return readDb().stations.find((s) => s.estado.toUpperCase() === normalized)
}
