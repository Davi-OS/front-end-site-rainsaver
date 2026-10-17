export interface MonthlyCaptation {
  year: number
  /** 1 = January */
  month: number
  rainfallMm: number
  capturedLiters: number
}

/** A pluvial economy calculation computed by the rain-saver backend. */
export interface PluvialEconomy {
  id: string
  enderecoId: string
  areaM2: number
  periodStart: string
  periodEnd: string
  createdAt: string
  /** INMET station nearest to the address, used for the rainfall data. */
  stationCode: string
  distanceKm: number
  months: MonthlyCaptation[]
}
