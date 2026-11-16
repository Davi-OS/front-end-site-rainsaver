import { useEffect, useState } from 'react'
import type { Station } from '@/types'
import { Alert, Card } from '@/components/ui'
import { StationsMap } from '@/components/map/StationsMap'
import { listStations } from '@/api/rainsaver'
import { rainSaverErrorMessage } from '@/lib/apiErrors'

export function DashboardPage() {
  const [stations, setStations] = useState<Station[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listStations()
      .then((list) => !cancelled && setStations(list))
      .catch((err) => !cancelled && setLoadError(rainSaverErrorMessage(err)))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Estações de medição meteorológica</h1>
        <p className="text-sm text-slate-500">
          Pontos de referência de pluviometria usados para estimar sua economia de água da chuva.
          {stations && ` ${stations.length} estações mapeadas.`}
        </p>
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : stations ? (
        <Card className="p-2">
          <StationsMap stations={stations} />
        </Card>
      ) : (
        <p className="text-sm text-slate-500" role="status">
          Carregando estações…
        </p>
      )}
    </div>
  )
}
