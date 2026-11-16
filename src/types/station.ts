export interface Station {
  code: string
  name: string
  /** Empty when the station has no state recorded */
  uf: string
  lat: number
  lng: number
}
