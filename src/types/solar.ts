export interface MonthlyGeneration {
  year: number
  /** 1 = January */
  month: number
  /** Average daily irradiation, kWh/m²/day (= peak sun hours). */
  avgDailyKWhM2: number
  generatedKWh: number
  /** generatedKWh × tariff; null when no tariff was entered. */
  savingsBRL: number | null
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
  /** Price of one kWh the user entered, R$; null when none. */
  tariffBRLPerKWh: number | null
  totalKWh: number
  monthlyAvgKWh: number
  totalSavingsBRL: number | null
  monthlyAvgSavingsBRL: number | null
  months: MonthlyGeneration[]
}
