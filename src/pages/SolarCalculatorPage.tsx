import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Address, SolarEconomy } from '@/types'
import { calculateSolarEconomy, latestSolarEconomy, listAddresses } from '@/api/rainsaver'
import { Alert, Button, Card, Input, Select } from '@/components/ui'
import { rainSaverErrorMessage } from '@/lib/apiErrors'
import { formatIrradiation, formatKm, formatKWh, formatKWp, formatMonth } from '@/lib/format'

export function SolarCalculatorPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [addressId, setAddressId] = useState('')
  const [panelPowerW, setPanelPowerW] = useState('')
  const [panelCount, setPanelCount] = useState('1')
  const [result, setResult] = useState<SolarEconomy | null>(null)
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

  // Show the last estimate of the selected address, if any.
  useEffect(() => {
    if (!addressId) return
    let cancelled = false
    setResult(null)
    latestSolarEconomy(addressId)
      .then((latest) => {
        if (cancelled || !latest) return
        setResult(latest)
        setPanelPowerW(String(latest.panelPowerW))
        setPanelCount(String(latest.panelCount))
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
        para adicionar um antes de calcular sua geração solar.
      </Alert>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const power = parseFloat(panelPowerW)
    if (!power || power <= 0 || power > 1000) {
      setError('Informe a potência da placa em watts (até 1000 W).')
      return
    }
    const count = Number(panelCount)
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      setError('Informe uma quantidade de placas entre 1 e 1000.')
      return
    }

    setCalculating(true)
    try {
      setResult(await calculateSolarEconomy(addressId, power, count))
    } catch (err) {
      setError(rainSaverErrorMessage(err))
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <Card className="w-full lg:max-w-md">
        <h1 className="mb-4 text-lg font-semibold text-slate-900">Calculadora de Geração Solar</h1>

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
            label="Potência de cada placa (W)"
            name="panelPowerW"
            type="number"
            min="1"
            max="1000"
            step="1"
            placeholder="Exemplo: 550"
            value={panelPowerW}
            onChange={(e) => setPanelPowerW(e.target.value)}
            required
          />

          <Input
            label="Quantidade de placas"
            name="panelCount"
            type="number"
            min="1"
            max="1000"
            step="1"
            value={panelCount}
            onChange={(e) => setPanelCount(e.target.value)}
            required
          />

          <p className="text-xs text-slate-500">
            Usamos a irradiação solar medida nos últimos 12 meses pela estação do INMET mais próxima do endereço que
            mede radiação. A estimativa desconta 15% de perdas (inversor, cabos, calor e sujeira) e considera a
            irradiação no plano horizontal, sem a inclinação da placa.
          </p>

          <Button type="submit" fullWidth disabled={calculating}>
            {calculating ? 'Calculando…' : 'Calcular geração'}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="w-full">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Resultado estimado</h2>
          <p className="mb-4 text-sm text-slate-500">
            Estação INMET {result.stationCode}, a {formatKm(result.distanceKm)} do endereço · {result.panelCount} ×{' '}
            {result.panelPowerW} W = {formatKWp(result.systemKWp)}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Mês</th>
                  <th className="py-2 pr-4 text-right font-medium">Irradiação média</th>
                  <th className="py-2 text-right font-medium">Geração</th>
                </tr>
              </thead>
              <tbody>
                {result.months.map((m) => (
                  <tr key={`${m.year}-${m.month}`} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-700">{formatMonth(m.year, m.month)}</td>
                    <td className="py-2 pr-4 text-right text-slate-500">{formatIrradiation(m.avgDailyKWhM2)}</td>
                    <td className="py-2 text-right font-medium text-amber-600">{formatKWh(m.generatedKWh)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-50 p-4">
            <div>
              <p className="text-xs font-medium text-amber-700">Total em {result.months.length} meses</p>
              <p className="text-sm text-amber-900">Média de {formatKWh(result.monthlyAvgKWh)} por mês</p>
            </div>
            <p className="text-xl font-bold text-amber-600">{formatKWh(result.totalKWh)}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
