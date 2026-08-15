import type { PluvialResult, QuarterResult } from '@/types'

export const RUNOFF_EFFICIENCY = 0.8

const QUARTER_LABELS = ['Jan–Mar', 'Abr–Jun', 'Jul–Set', 'Out–Dez'] as const
const QUARTER_MONTH_INDEXES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
]

export interface CalculatePluvialEconomyParams {
  stationId: string
  roofAreaM2: number
  monthlyRainfallMm: number[]
  tariffPerM3: number
  efficiency?: number
}

export function calculatePluvialEconomy({
  stationId,
  roofAreaM2,
  monthlyRainfallMm,
  tariffPerM3,
  efficiency = RUNOFF_EFFICIENCY,
}: CalculatePluvialEconomyParams): PluvialResult {
  const quarters: QuarterResult[] = QUARTER_MONTH_INDEXES.map((monthIndexes, i) => {
    const rainfallMm = monthIndexes.reduce((sum, monthIndex) => sum + monthlyRainfallMm[monthIndex], 0)
    const litersCaptured = roofAreaM2 * rainfallMm * efficiency
    const savingsBRL = (litersCaptured / 1000) * tariffPerM3

    return {
      quarter: (i + 1) as 1 | 2 | 3 | 4,
      label: QUARTER_LABELS[i],
      rainfallMm,
      litersCaptured,
      savingsBRL,
    }
  })

  return {
    stationId,
    quarters,
    totals: {
      rainfallMm: quarters.reduce((sum, q) => sum + q.rainfallMm, 0),
      litersCaptured: quarters.reduce((sum, q) => sum + q.litersCaptured, 0),
      savingsBRL: quarters.reduce((sum, q) => sum + q.savingsBRL, 0),
    },
  }
}
