export interface MonthlyGeneration {
  year: number
  /** 1 = January */
  month: number
  /** Average daily irradiation, kWh/m²/day (= peak sun hours). */
  avgDailyKWhM2: number
  generatedKWh: number
}

/** A photovoltaic generation estimate computed by the rain-saver backend. */
export interface SolarEconomy {
  id: string
  enderecoId: string
  panelPowerW: number
  panelCount: number
  systemKWp: number
  /** Share of nominal output assumed lost, e.g. 0.15. */
  lossFactor: number
  periodStart: string
  periodEnd: string
  createdAt: string
  /** Nearest INMET station with solar data, used for the irradiation. */
  stationCode: string
  distanceKm: number
  totalKWh: number
  monthlyAvgKWh: number
  months: MonthlyGeneration[]
}
