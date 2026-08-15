export interface QuarterResult {
  quarter: 1 | 2 | 3 | 4
  label: string
  rainfallMm: number
  litersCaptured: number
  savingsBRL: number
}

export interface PluvialResult {
  stationId: string
  quarters: QuarterResult[]
  totals: {
    rainfallMm: number
    litersCaptured: number
    savingsBRL: number
  }
}

export interface PluvialCalculation {
  id: string
  userId: string
  addressId: string
  stationId: string
  roofAreaM2: number
  tariffPerM3: number
  result: PluvialResult
  createdAt: string
}
