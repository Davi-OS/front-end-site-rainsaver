import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Address, PluvialEconomy } from '@/types'
import { calculatePluvialEconomy, latestPluvialEconomy, listAddresses } from '@/api/rainsaver'
import { Alert, Button, Card, Input, Select } from '@/components/ui'
import { rainSaverErrorMessage } from '@/lib/apiErrors'
import { formatBRL, formatKm, formatLiters, formatMm, formatMonth } from '@/lib/format'

const DEFAULT_TARIFF_PER_M3 = '8.5'

export function PluvialCalculatorPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [addressId, setAddressId] = useState('')
  const [roofAreaM2, setRoofAreaM2] = useState('')
  const [tariffPerM3, setTariffPerM3] = useState(DEFAULT_TARIFF_PER_M3)
  const [result, setResult] = useState<PluvialEconomy | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    let cancelled = false
    listAddresses()
      .then((list) => {
        if (cancelled) return
        setAddresses(list)
        setAddressId(list[0]?.id ?? '')
      })
      .catch((err) => !cancelled && setError(rainSaverErrorMessage(err)))
    return () => {
      cancelled = true
    }
  }, [])

  // Show the last calculation of the selected address, if any.
  useEffect(() => {
    if (!addressId) return
    let cancelled = false
    setResult(null)
    latestPluvialEconomy(addressId)
      .then((latest) => {
        if (cancelled || !latest) return
        setResult(latest)
        setRoofAreaM2(String(latest.areaM2))
      })
      .catch(() => undefined) // not having a previous result is fine
    return () => {
      cancelled = true
    }
  }, [addressId])

  if (addresses === null) {
    return error ? (
      <Alert variant="error">{error}</Alert>
    ) : (
      <p className="py-8 text-center text-sm text-slate-500">Carregando endereços…</p>
    )
  }

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const roofArea = parseFloat(roofAreaM2)
    if (!roofArea || roofArea <= 0) {
      setError('Informe uma área de captação válida.')
      return
    }
    const tariff = parseFloat(tariffPerM3)
    if (!tariff || tariff <= 0) {
      setError('Informe uma tarifa de água válida.')
      return
    }

    setCalculating(true)
    try {
      setResult(await calculatePluvialEconomy(addressId, roofArea))
    } catch (err) {
      setError(rainSaverErrorMessage(err))
    } finally {
      setCalculating(false)
    }
  }

  // The backend computes captured liters (1 mm over 1 m² = 1 L, no losses
  // factor); the R$ figure is only presentation, using the user's tariff.
  const tariff = parseFloat(tariffPerM3) || 0
  const savings = (liters: number) => (liters / 1000) * tariff
  const totalLiters = result?.months.reduce((sum, m) => sum + m.capturedLiters, 0) ?? 0
  const totalRainfall = result?.months.reduce((sum, m) => sum + m.rainfallMm, 0) ?? 0

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
            Usamos a chuva medida nos últimos 12 meses pela estação do INMET mais próxima do endereço. Cada 1 mm de
            chuva sobre 1 m² de telhado equivale a 1 litro captado (sem descontar perdas).
          </p>

          <Button type="submit" fullWidth disabled={calculating}>
            {calculating ? 'Calculando…' : 'Calcular economia'}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="w-full">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Resultado estimado</h2>
          <p className="mb-4 text-sm text-slate-500">
            Estação INMET {result.stationCode}, a {formatKm(result.distanceKm)} do endereço · telhado de{' '}
            {result.areaM2} m²
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Mês</th>
                  <th className="py-2 pr-4 text-right font-medium">Chuva</th>
                  <th className="py-2 pr-4 text-right font-medium">Captado</th>
                  <th className="py-2 text-right font-medium">Economia</th>
                </tr>
              </thead>
              <tbody>
                {result.months.map((m) => (
                  <tr key={`${m.year}-${m.month}`} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-700">{formatMonth(m.year, m.month)}</td>
                    <td className="py-2 pr-4 text-right text-slate-500">{formatMm(m.rainfallMm)}</td>
                    <td className="py-2 pr-4 text-right text-slate-900">{formatLiters(m.capturedLiters)}</td>
                    <td className="py-2 text-right font-medium text-emerald-600">{formatBRL(savings(m.capturedLiters))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-50 p-4">
            <div>
              <p className="text-xs font-medium text-brand-700">Total em {result.months.length} meses</p>
              <p className="text-sm text-brand-900">
                {formatLiters(totalLiters)} captados · {formatMm(totalRainfall)} de chuva
              </p>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatBRL(savings(totalLiters))}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
