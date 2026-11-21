import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useFocusFirstError } from '@/lib/useFocusFirstError'
import { Link } from 'react-router-dom'
import type { Address, SolarEconomy } from '@/types'
import { calculateSolarEconomy, latestSolarEconomy, listAddresses } from '@/api/rainsaver'
import { Alert, Button, Card, Input, Select, Skeleton } from '@/components/ui'
import { AdSlot } from '@/components/ads/AdSlot'
import { PageHeader } from '@/components/layout/PageHeader'
import { rainSaverErrorMessage } from '@/lib/apiErrors'
import { formatBRL, formatKm, formatKWh, formatKWp, formatMonth } from '@/lib/format'

const HEADER = (
  <PageHeader
    title="Geração solar"
    description="Quanta energia suas placas geram por mês no seu endereço, e quanto isso economiza na conta de luz."
  />
)

export function SolarCalculatorPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [addressId, setAddressId] = useState('')
  const [panelPowerW, setPanelPowerW] = useState('')
  const [panelCount, setPanelCount] = useState('1')
  const [tariff, setTariff] = useState('')
  const [result, setResult] = useState<SolarEconomy | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calculating, setCalculating] = useState(false)
  // Bumped after each estimate the user asks for, to bring the result into view.
  const [calculations, setCalculations] = useState(0)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  // The result of the calculation the user triggered (not one preloaded for the address): that one earns an ad.
  const [adResult, setAdResult] = useState<SolarEconomy | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ power?: string; count?: string; tariff?: string }>({})
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstError = useFocusFirstError(formRef)
  const clearError = (field: 'power' | 'count' | 'tariff') => setFieldErrors((f) => ({ ...f, [field]: undefined }))

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
        setTariff(latest.tariffBRLPerKWh === null ? '' : String(latest.tariffBRLPerKWh).replace('.', ','))
      })
      .catch(() => undefined) // not having a previous result is fine
    return () => {
      cancelled = true
    }
  }, [addressId])

  // Move focus to the result. Below `lg` it sits under the form, so also bring it
  // to the top; side by side (lg+) it is already visible and the page must not jump.
  useEffect(() => {
    if (calculations === 0) return
    const heading = resultHeadingRef.current
    heading?.focus({ preventScroll: true })
    const sideBySide = window.matchMedia('(min-width: 1024px)').matches
    heading?.scrollIntoView({ block: sideBySide ? 'nearest' : 'start' })
  }, [calculations])

  if (addresses === null) {
    return (
      <div>
        {HEADER}
        {error ? (
          <Alert variant="error">{error}</Alert>
        ) : (
          <div role="status" aria-busy="true">
            <span className="sr-only">Carregando endereços…</span>
            <Skeleton className="h-96 w-full max-w-md rounded-2xl" />
          </div>
        )}
      </div>
    )
  }

  if (addresses.length === 0) {
    return (
      <div>
        {HEADER}
        <Alert variant="warning">
          Você ainda não tem um endereço cadastrado. Vá até{' '}
          <Link to="/settings" className="font-semibold underline">
            Configurações
          </Link>{' '}
          para adicionar um antes de calcular sua geração solar.
        </Alert>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const power = parseFloat(panelPowerW)
    const count = Number(panelCount)
    // Optional; accepts "0,95" or "0.95".
    const tariffText = tariff.trim().replace(',', '.')
    const tariffValue = tariffText === '' ? undefined : Number(tariffText)

    const errors: { power?: string; count?: string; tariff?: string } = {}
    if (!power || power <= 0 || power > 1000) errors.power = 'Informe a potência da placa em watts, até 1.000 W. Exemplo: 550.'
    if (!Number.isInteger(count) || count < 1 || count > 1000) errors.count = 'Informe uma quantidade de placas entre 1 e 1.000.'
    if (tariffValue !== undefined && !(tariffValue > 0 && tariffValue <= 10)) {
      errors.tariff = 'Informe o valor do kWh entre R$ 0,01 e R$ 10,00, ou deixe em branco.'
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstError()
      return
    }

    setCalculating(true)
    try {
      const created = await calculateSolarEconomy(addressId, power, count, tariffValue)
      setResult(created)
      setAdResult(created)
      setCalculations((n) => n + 1)
    } catch (err) {
      setError(rainSaverErrorMessage(err))
    } finally {
      setCalculating(false)
    }
  }

  const hasSavings = result?.totalSavingsBRL != null

  return (
    <div>
      {HEADER}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="w-full lg:max-w-md">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Dados do sistema</h2>

          {error && (
            <Alert variant="error" className="mb-4" focusOnMount>
              {error}
            </Alert>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
              inputMode="numeric"
              autoComplete="off"
              min="1"
              max="1000"
              step="1"
              placeholder="Exemplo: 550…"
              value={panelPowerW}
              error={fieldErrors.power}
              onChange={(e) => {
                setPanelPowerW(e.target.value)
                clearError('power')
              }}
              required
            />

            <Input
              label="Quantidade de placas"
              name="panelCount"
              type="number"
              inputMode="numeric"
              autoComplete="off"
              min="1"
              max="1000"
              step="1"
              value={panelCount}
              error={fieldErrors.count}
              onChange={(e) => {
                setPanelCount(e.target.value)
                clearError('count')
              }}
              required
            />

            <Input
              label="Valor do kWh (R$), opcional"
              name="tariff"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Exemplo: 0,95…"
              value={tariff}
              error={fieldErrors.tariff}
              onChange={(e) => {
                setTariff(e.target.value)
                clearError('tariff')
              }}
            />
            <p className="-mt-2 text-xs text-slate-600">Está na sua conta de luz. Sem ele mostramos só os kWh.</p>

            <p className="text-xs text-slate-600">
              Usamos a irradiação solar medida nos últimos 12 meses pela estação do INMET mais próxima do endereço que
              mede radiação. A estimativa desconta 15% de perdas (inversor, cabos, calor e sujeira) e considera a
              irradiação no plano horizontal, sem a inclinação da placa.
            </p>

            <Button type="submit" fullWidth disabled={calculating}>
              {calculating ? 'Calculando…' : 'Calcular geração'}
            </Button>
          </form>
        </Card>

        {/* Always rendered so assistive tech announces the result when it appears. */}
        <div className="w-full min-w-0">
          <div aria-live="polite">
          {result ? (
            <Card>
              <h2 ref={resultHeadingRef} tabIndex={-1} className="text-xl font-semibold text-slate-900">
                Resultado estimado
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Estação INMET {result.stationCode}, a {formatKm(result.distanceKm)} do endereço · {result.panelCount} ×{' '}
                {result.panelPowerW}&nbsp;W = {formatKWp(result.systemKWp)}
                {result.tariffBRLPerKWh !== null && <> · tarifa de {formatBRL(result.tariffBRLPerKWh)}/kWh</>}
              </p>

              <div className="my-5 rounded-2xl bg-sun-50 p-5">
                <p className="text-sm font-medium text-sun-800">
                  {hasSavings
                    ? `Você economiza em ${result.months.length} meses`
                    : `Total gerado em ${result.months.length} meses`}
                </p>
                <p className="font-display text-4xl font-semibold text-sun-700 tabular-nums">
                  {hasSavings && result.totalSavingsBRL !== null
                    ? formatBRL(result.totalSavingsBRL)
                    : formatKWh(result.totalKWh)}
                </p>
                <p className="mt-1 text-sm text-sun-900">
                  {hasSavings && result.monthlyAvgSavingsBRL !== null
                    ? `${formatKWh(result.totalKWh)} gerados · média de ${formatBRL(result.monthlyAvgSavingsBRL)} por mês`
                    : `Média de ${formatKWh(result.monthlyAvgKWh)} por mês`}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm tabular-nums">
                  <caption className="sr-only">Geração de energia{hasSavings ? ' e economia' : ''} por mês</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th scope="col" className="py-2 pr-4 font-medium">
                        Mês
                      </th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">
                        Geração
                      </th>
                      {hasSavings && (
                        <th scope="col" className="py-2 text-right font-medium">
                          Economia
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {result.months.map((m) => (
                      <tr key={`${m.year}-${m.month}`} className="border-b border-slate-100">
                        <th scope="row" className="py-2 pr-4 font-normal whitespace-nowrap text-slate-700">
                          {formatMonth(m.year, m.month)}
                        </th>
                        <td className="py-2 pr-4 text-right whitespace-nowrap text-slate-700">
                          {formatKWh(m.generatedKWh)}
                        </td>
                        {hasSavings && (
                          <td className="py-2 text-right font-medium whitespace-nowrap text-emerald-700">
                            {m.savingsBRL !== null && formatBRL(m.savingsBRL)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <p className="hidden rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-sm text-slate-600 lg:block">
              Preencha os dados e calcule: o resultado aparece aqui.
            </p>
          )}
          </div>
          {/* Outside the live region (assistive tech should not read it); the key renews it on every calculation. */}
          {result !== null && result === adResult && (
            <AdSlot placement="solar-result" key={calculations} className="mt-4" />
          )}
        </div>
      </div>
    </div>
  )
}
