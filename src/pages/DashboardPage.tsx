import { useMemo } from 'react'
import { Card } from '@/components/ui'
import { StationsMap } from '@/components/map/StationsMap'
import { listStations } from '@/db/stations'
import { formatMm } from '@/lib/format'

function annualRainfall(monthlyRainfallMm: number[]): number {
  return monthlyRainfallMm.reduce((sum, mm) => sum + mm, 0)
}

export function DashboardPage() {
  const stations = useMemo(() => listStations(), [])
  const ranked = useMemo(
    () =>
      [...stations]
        .map((station) => ({ station, annual: annualRainfall(station.monthlyRainfallMm) }))
        .sort((a, b) => b.annual - a.annual),
    [stations],
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Estações de medição meteorológica</h1>
        <p className="text-sm text-slate-500">
          Pontos de referência de pluviometria usados para estimar sua economia de água da chuva.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="flex-1 p-2">
          <StationsMap
            stations={stations}
            annualRainfall={(station) => annualRainfall(station.monthlyRainfallMm)}
          />
        </Card>

        <Card className="w-full lg:w-72">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Maior volume de chuva anual</h2>
          <ol className="flex flex-col gap-2 text-sm">
            {ranked.slice(0, 10).map(({ station, annual }, index) => (
              <li key={station.id} className="flex items-center justify-between text-slate-700">
                <span>
                  {index + 1}. {station.name} – {station.estado}
                </span>
                <span className="text-slate-400">{formatMm(annual)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
