import type { Station } from './station'

// Mocked data still kept in localStorage: only the dashboard's stations.
// Accounts live in go-auth-service; addresses and calculations in rain-saver.
export interface Db {
  stations: Station[]
}
