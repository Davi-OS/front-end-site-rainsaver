import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { PluvialResult } from '@/types'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Card, Input, Select } from '@/components/ui'
import { listAddressesByUser } from '@/db/addresses'
import { findStationByEstado } from '@/db/stations'
import { calculatePluvialEconomy, RUNOFF_EFFICIENCY } from '@/lib/pluvial'
import { formatBRL, formatLiters, formatMm } from '@/lib/format'

export function PluvialCalculatorPage() {
  const { user } = useAuth()
  const addresses = useMemo(() => listAddressesByUser(user!.id), [user])

  const [addressId, setAddressId] = useState(addresses[0]?.id ?? '')
  const [roofAreaM2, setRoofAreaM2] = useState('')
  const [tariffPerM3, setTariffPerM3] = useState('8.5')
  const [result, setResult] = useState<PluvialResult | null>(null)
  const [stationLabel, setStationLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (addresses.length === 0) {
    return (
      <Alert variant="warning">
        Você ainda não tem um endereço cadastrado. Vá até{' '}
        <Link to="/settings" className="font-medium underline">
          Configurações
        </Link>{' '}
        para adicionar um antes de calcular sua economia pluvial.
      </Alert>
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const address = addresses.find((a) => a.id === addressId)
    if (!address) {
      setError('Selecione um endereço válido.')
      return
    }
    const station = findStationByEstado(address.estado)
    if (!station) {
      setError(`Não encontramos uma estação de referência para o estado ${address.estado}.`)
      return
    }
    const roofArea = parseFloat(roofAreaM2)
    const tariff = parseFloat(tariffPerM3)
    if (!roofArea || roofArea <= 0) {
      setError('Informe uma área de captação válida.')
      return
    }
    if (!tariff || tariff <= 0) {
      setError('Informe uma tarifa de água válida.')
      return
    }

    setResult(
      calculatePluvialEconomy({
        stationId: station.id,
        roofAreaM2: roofArea,
        monthlyRainfallMm: station.monthlyRainfallMm,
        tariffPerM3: tariff,
      }),
    )
    setStationLabel(`${station.name} – ${station.estado}`)
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Card className="w-full lg:max-w-md">
        <h1 className="mb-4 text-lg font-semibold text-slate-900">Calculadora de Economia Pluvial</h1>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Endereço"
            name="addressId"
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
          >
            {addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.logradouro}, {address.number} — {address.cidade}/{address.estado}
              </option>
            ))}
          </Select>

          <Input
            label="Área de captação do telhado (m²)"
            name="roofAreaM2"
            type="number"
            min="0"
            step="0.1"
            placeholder="Exemplo: 50"
            value={roofAreaM2}
            onChange={(e) => setRoofAreaM2(e.target.value)}
            required
          />

          <Input
            label="Tarifa de água (R$/m³)"
            name="tariffPerM3"
            type="number"
            min="0"
            step="0.01"
            value={tariffPerM3}
            onChange={(e) => setTariffPerM3(e.target.value)}
            required
          />

          <p className="text-xs text-slate-500">
            Consideramos um coeficiente de aproveitamento de {RUNOFF_EFFICIENCY * 100}%, já
            descontando perdas por evaporação, filtragem e descarte da primeira chuva (first-flush).
          </p>

          <Button type="submit" fullWidth>
            Calcular economia
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="w-full">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Resultado estimado</h2>
          <p className="mb-4 text-sm text-slate-500">Estação de referência: {stationLabel}</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {result.quarters.map((quarter) => (
              <div key={quarter.quarter} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-500">{quarter.label}</p>
                <p className="mt-1 text-xs text-slate-400">{formatMm(quarter.rainfallMm)}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatLiters(quarter.litersCaptured)}</p>
                <p className="text-sm font-semibold text-emerald-600">{formatBRL(quarter.savingsBRL)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-50 p-4">
            <div>
              <p className="text-xs font-medium text-brand-700">Total anual estimado</p>
              <p className="text-sm text-brand-900">{formatLiters(result.totals.litersCaptured)} captados</p>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatBRL(result.totals.savingsBRL)}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
