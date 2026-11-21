import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarRange, Droplets, Home, MapPin, Sun, type LucideIcon } from 'lucide-react'
import type { Station } from '@/types'
import { Alert, ButtonLink, Card, Skeleton, StatTile } from '@/components/ui'
import { AdSlot } from '@/components/ads/AdSlot'
import { PageHeader } from '@/components/layout/PageHeader'
import { StationsList } from '@/components/map/StationsList'
import { StationsMap } from '@/components/map/StationsMap'
import { useAuth } from '@/auth/useAuth'
import { listAddresses, listStations } from '@/api/rainsaver'
import { rainSaverErrorMessage } from '@/lib/apiErrors'

interface ShortcutProps {
  to: string
  icon: LucideIcon
  title: string
  description: string
  tone: 'brand' | 'sun'
}

const SHORTCUT_TONES = {
  brand: 'bg-brand-100 text-brand-800',
  sun: 'bg-sun-100 text-sun-800',
}

function Shortcut({ to, icon: Icon, title, description, tone }: ShortcutProps) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${SHORTCUT_TONES[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-semibold text-slate-900">
          {title}
          <ArrowRight
            className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </span>
        <span className="mt-1 block text-sm text-slate-600">{description}</span>
      </span>
    </Link>
  )
}

export function DashboardPage() {
  const { status } = useAuth()
  // `loading` only happens when a saved session is being validated, so it is a
  // returning user: keep their layout rather than flashing the visitor one.
  const visitor = status === 'anonymous'

  const [stations, setStations] = useState<Station[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  // null while loading or if it failed: the tile then shows "—" (not essential).
  const [addressCount, setAddressCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    listStations()
      .then((list) => !cancelled && setStations(list))
      .catch((err) => !cancelled && setLoadError(rainSaverErrorMessage(err)))
    return () => {
      cancelled = true
    }
  }, [])

  // Addresses need an account. Never call this as a visitor: authorized() would
  // treat the missing tokens as an expired session and show that notice at login.
  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    listAddresses()
      .then((list) => !cancelled && setAddressCount(list.length))
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [status])

  const number = new Intl.NumberFormat('pt-BR')

  return (
    <div>
      <PageHeader
        title={visitor ? 'Economize com a chuva e o sol' : 'Seu painel'}
        description={
          visitor
            ? 'Descubra quanto a água da chuva e a energia solar podem reduzir suas contas, com dados reais das estações do INMET mais próximas de você.'
            : 'Veja quanto a chuva e o sol podem reduzir suas contas, com dados reais das estações do INMET mais próximas de você.'
        }
      />

      {visitor && (
        <section
          aria-labelledby="cta-cadastro"
          className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="min-w-0">
            <h2 id="cta-cadastro" className="text-xl font-semibold text-brand-900">
              Crie sua conta grátis
            </h2>
            <p className="mt-1 text-sm text-pretty text-brand-900">
              Cadastre seu endereço e calcule a economia na conta de água e de luz da sua casa.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <ButtonLink to="/cadastro">Criar conta</ButtonLink>
            <ButtonLink to="/login" variant="secondary">
              Já tenho conta
            </ButtonLink>
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          icon={MapPin}
          label="Estações mapeadas"
          value={stations ? number.format(stations.length) : '—'}
          hint="Pontos de medição do INMET"
        />
        {visitor ? (
          <StatTile
            icon={CalendarRange}
            tone="sun"
            label="Período analisado"
            value="12&nbsp;meses"
            hint="Dados medidos, não médias"
          />
        ) : (
          <StatTile
            icon={Home}
            tone="sun"
            label="Seus endereços"
            value={addressCount === null ? '—' : number.format(addressCount)}
            hint={addressCount === 0 ? 'Cadastre um em Configurações' : 'Usados nos cálculos'}
          />
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Shortcut
          to="/pluvial"
          icon={Droplets}
          tone="brand"
          title="Economia pluvial"
          description="Estime os litros captados no seu telhado e o quanto isso economiza na conta de água."
        />
        <Shortcut
          to="/solar"
          icon={Sun}
          tone="sun"
          title="Geração solar"
          description="Calcule quanto suas placas geram por mês e o valor economizado na conta de luz."
        />
      </div>

      <h2 className="mt-8 mb-3 text-xl font-semibold text-slate-900">Estações de medição</h2>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : stations === null ? (
        <div role="status" aria-busy="true">
          <span className="sr-only">Carregando estações…</span>
          <Skeleton className="h-[50vh] max-h-[520px] min-h-72 w-full rounded-2xl" />
        </div>
      ) : stations.length === 0 ? (
        <Alert variant="info">Nenhuma estação foi cadastrada ainda.</Alert>
      ) : (
        <>
          <Card className="p-2">
            <div role="region" aria-label={`Mapa com ${stations.length} estações de medição`}>
              <StationsMap stations={stations} />
            </div>
          </Card>
          <StationsList stations={stations} />
        </>
      )}

      <AdSlot placement="home-below-map" />
    </div>
  )
}
