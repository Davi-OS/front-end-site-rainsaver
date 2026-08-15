export interface Station {
  id: string
  name: string
  cidade: string
  estado: string
  lat: number
  lng: number
  /** Average rainfall in mm, index 0 = January ... index 11 = December */
  monthlyRainfallMm: number[]
}
