import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useFocusFirstError } from '@/lib/useFocusFirstError'
import { Link } from 'react-router-dom'
import type { Address, PluvialEconomy } from '@/types'
import { calculatePluvialEconomy, latestPluvialEconomy, listAddresses } from '@/api/rainsaver'
import { Alert, Button, Card, Input, Select, Skeleton } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { rainSaverErrorMessage } from '@/lib/apiErrors'
import { formatBRL, formatKm, formatLiters, formatMm, formatMonth } from '@/lib/format'

const DEFAULT_TARIFF_PER_M3 = '8.5'

const HEADER = (
  <PageHeader
    title="Economia pluvial"
    description="Quanto da chuva que cai no seu telhado dá para aproveitar, e quanto isso vale na conta de água."
  />
)

export function PluvialCalculatorPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [addressId, setAddressId] = useState('')
  const [roofAreaM2, setRoofAreaM2] = useState('')
  const [tariffPerM3, setTariffPerM3] = useState(DEFAULT_TARIFF_PER_M3)
  const [result, setResult] = useState<PluvialEconomy | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [calculating, setCalculating] = useState(false)
  // Bumped after each calculation the user asks for, to bring the result into view.
  const [calculations, setCalculations] = useState(0)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)
  const [fieldErrors, setFieldErrors] = useState<{ roofArea?: string; tariff?: string }>({})
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstError = useFocusFirstError(formRef)

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
          para adicionar um antes de calcular sua economia pluvial.
        </Alert>
      </div>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const roofArea = parseFloat(roofAreaM2)
    const tariff = parseFloat(tariffPerM3)
    const errors: { roofArea?: string; tariff?: string } = {}
    if (!roofArea || roofArea <= 0) errors.roofArea = 'Informe a área do telhado em m², maior que zero. Exemplo: 50.'
    if (!tariff || tariff <= 0) errors.tariff = 'Informe a tarifa de água em R$/m³, maior que zero. Exemplo: 8,50.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstError()
      return
    }

    setCalculating(true)
    try {
      setResult(await calculatePluvialEconomy(addressId, roofArea))
      setCalculations((n) => n + 1)
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
    <div>
      {HEADER}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="w-full lg:max-w-md">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Dados do telhado</h2>

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
              label="Área de captação do telhado (m²)"
              name="roofAreaM2"
              type="number"
              inputMode="decimal"
              autoComplete="off"
              min="0"
              step="0.1"
              placeholder="Exemplo: 50…"
              value={roofAreaM2}
              error={fieldErrors.roofArea}
              onChange={(e) => {
                setRoofAreaM2(e.target.value)
                setFieldErrors((f) => ({ ...f, roofArea: undefined }))
              }}
              required
            />

            <Input
              label="Tarifa de água (R$/m³)"
              name="tariffPerM3"
              type="number"
              inputMode="decimal"
              autoComplete="off"
              min="0"
              step="0.01"
              value={tariffPerM3}
              error={fieldErrors.tariff}
              onChange={(e) => {
                setTariffPerM3(e.target.value)
                setFieldErrors((f) => ({ ...f, tariff: undefined }))
              }}
              required
            />

            <p className="text-xs text-slate-600">
              Usamos a chuva medida nos últimos 12 meses pela estação do INMET mais próxima do endereço. Cada 1&nbsp;mm
              de chuva sobre 1&nbsp;m² de telhado equivale a 1&nbsp;litro captado (sem descontar perdas).
            </p>

            <Button type="submit" fullWidth disabled={calculating}>
              {calculating ? 'Calculando…' : 'Calcular economia'}
            </Button>
          </form>
        </Card>

        {/* Always rendered so assistive tech announces the result when it appears. */}
        <div aria-live="polite" className="w-full min-w-0">
          {result ? (
            <Card>
              <h2 ref={resultHeadingRef} tabIndex={-1} className="text-xl font-semibold text-slate-900">
                Resultado estimado
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Estação INMET {result.stationCode}, a {formatKm(result.distanceKm)} do endereço · telhado de{' '}
                {result.areaM2}&nbsp;m²
              </p>

              <div className="my-5 rounded-2xl bg-brand-50 p-5">
                <p className="text-sm font-medium text-brand-800">
                  Você pode economizar em {result.months.length} meses
                </p>
                <p className="font-display text-4xl font-semibold text-emerald-700 tabular-nums">
                  {formatBRL(savings(totalLiters))}
                </p>
                <p className="mt-1 text-sm text-brand-900">
                  {formatLiters(totalLiters)} captados · {formatMm(totalRainfall)} de chuva
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm tabular-nums">
                  <caption className="sr-only">Chuva, volume captado e economia por mês</caption>
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th scope="col" className="py-2 pr-4 font-medium">
                        Mês
                      </th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">
                        Chuva
                      </th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">
                        Captado
                      </th>
                      <th scope="col" className="py-2 text-right font-medium">
                        Economia
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.months.map((m) => (
                      <tr key={`${m.year}-${m.month}`} className="border-b border-slate-100">
                        <th scope="row" className="py-2 pr-4 font-normal whitespace-nowrap text-slate-700">
                          {formatMonth(m.year, m.month)}
                        </th>
                        <td className="py-2 pr-4 text-right whitespace-nowrap text-slate-600">{formatMm(m.rainfallMm)}</td>
                        <td className="py-2 pr-4 text-right whitespace-nowrap text-slate-900">
                          {formatLiters(m.capturedLiters)}
                        </td>
                        <td className="py-2 text-right font-medium whitespace-nowrap text-emerald-700">
                          {formatBRL(savings(m.capturedLiters))}
                        </td>
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
      </div>
    </div>
  )
}
