import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Alert, Button, ButtonLink, Card, Skeleton } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { CancelSubscriptionModal } from '@/components/subscription/CancelSubscriptionModal'
import { ConfirmSubscriptionModal } from '@/components/subscription/ConfirmSubscriptionModal'
import { PlanPicker } from '@/components/subscription/PlanPicker'
import { SubscriptionStatusCard } from '@/components/subscription/SubscriptionStatusCard'
import { useAuth } from '@/auth/useAuth'
import { formatDate } from '@/lib/format'
import type { PlanId } from '@/subscription/types'
import { usePlans } from '@/subscription/usePlans'
import { useSubscription } from '@/subscription/useSubscription'

// Only what actually exists today: don't promise features that aren't there.
const BENEFITS = ['Sem anúncios em todo o site', 'Ajuda a manter o RainSaver no ar']

function Benefits() {
  return (
    <Card>
      <h2 className="mb-3 text-xl font-semibold text-slate-900">O que você ganha</h2>
      <ul className="flex flex-col gap-2 text-sm text-slate-700">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            {benefit}
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function SubscriptionPage() {
  const { status } = useAuth()
  const { mode, ready, isSubscriber, subscription, pending, error, clearError, subscribe, cancel, resume } =
    useSubscription()
  const { plans, loading: plansLoading, error: plansError, failures, reload: reloadPlans } = usePlans()
  const choiceRef = useRef<HTMLDivElement>(null)
  const retried = useRef(false)
  const [planId, setPlanId] = useState<PlanId | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // After a retry that worked, the retry button is gone: put focus on the plans so keyboard users don't land on <body>.
  useEffect(() => {
    if (retried.current && !plansLoading && !plansError && plans) {
      retried.current = false
      choiceRef.current?.focus()
    }
  }, [plansLoading, plansError, plans])

  // The screens only exist while the feature is on.
  if (mode === 'off') return <Navigate to="/" replace />

  const busy = pending !== null
  // The plan being offered: the visitor's pick, else the one the backend highlights, else the first.
  const selected = plans?.find((p) => p.id === planId) ?? plans?.find((p) => p.highlight) ?? plans?.[0] ?? null
  const modalOpen = confirming || canceling
  // After sign-up/login the visitor should land back here.
  const backHere = { from: { pathname: '/assinatura', search: '' } }

  const openConfirm = () => {
    clearError()
    setNotice(null)
    setConfirming(true)
  }

  const openCancel = () => {
    clearError()
    setNotice(null)
    setCanceling(true)
  }

  const handleSubscribe = async () => {
    if (selected && (await subscribe(selected))) {
      setConfirming(false)
      setNotice('Assinatura ativada. Obrigado por apoiar o RainSaver! Os anúncios foram removidos.')
    }
  }

  const handleCancel = async () => {
    if (await cancel()) setCanceling(false)
  }

  const handleResume = async () => {
    setNotice(null)
    if (await resume()) setNotice('Assinatura reativada. Você segue sem anúncios.')
  }

  // Plans come from the backend, so this block has its own loading, error and empty states.
  const planChoice = (interactive: boolean) => {
    // The error is checked first: while retrying it stays up (and the button keeps focus).
    if (plansError) {
      return (
        <div className="flex flex-col items-start gap-3">
          <Alert variant="error" className="w-full" key={failures}>
            {plansError}
          </Alert>
          <Button
            variant="secondary"
            onClick={() => {
              if (plansLoading) return
              retried.current = true
              reloadPlans()
            }}
          >
            {plansLoading ? 'Tentando…' : 'Tentar de novo'}
          </Button>
        </div>
      )
    }
    if (plansLoading) {
      return (
        <div role="status" aria-busy="true">
          <span className="sr-only">Carregando planos…</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      )
    }
    if (!plans || plans.length === 0) {
      return <Alert variant="info">Nenhum plano está disponível no momento. Volte em breve.</Alert>
    }
    return (
      <div ref={choiceRef} tabIndex={-1}>
        {interactive ? (
          <PlanPicker plans={plans} value={selected?.id} onChange={setPlanId} disabled={busy} />
        ) : (
          <PlanPicker plans={plans} />
        )}
      </div>
    )
  }

  let content
  if (status === 'anonymous') {
    content = (
      <div className="flex flex-col gap-6">
        <Benefits />
        {planChoice(false)}
        <Card className="flex flex-col gap-4 border-brand-200 bg-brand-50 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-brand-900">Para assinar, entre na sua conta ou crie uma gratuitamente.</p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to="/cadastro" state={backHere}>
              Criar conta
            </ButtonLink>
            <ButtonLink to="/login" variant="secondary" state={backHere}>
              Já tenho conta
            </ButtonLink>
          </div>
        </Card>
      </div>
    )
  } else if (!ready) {
    content = (
      <div role="status" aria-busy="true" className="flex flex-col gap-4">
        <span className="sr-only">Carregando assinatura…</span>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    )
  } else if (subscription) {
    content = (
      <div className="flex flex-col gap-4">
        {subscription.status === 'canceling' && (
          <Alert variant="info">
            Sua assinatura termina em <strong>{formatDate(subscription.periodEnd)}</strong>. Você continua sem anúncios
            até lá.
          </Alert>
        )}
        <SubscriptionStatusCard subscription={subscription} busy={busy} onCancel={openCancel} onResume={handleResume} />
      </div>
    )
  } else if (isSubscriber) {
    // Subscriber according to the token, with nothing to manage here.
    content = <Alert variant="info">Sua conta já tem uma assinatura ativa. Obrigado por apoiar o RainSaver!</Alert>
  } else {
    content = (
      <div className="flex flex-col gap-6">
        <Benefits />
        {planChoice(true)}
        {selected && (
          <div>
            <Button onClick={openConfirm} disabled={busy}>
              Assinar plano {selected.name}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Assinatura" description="Navegue sem anúncios e ajude a manter o RainSaver no ar." />

      {notice && (
        <Alert variant="success" className="mb-4" focusOnMount key={notice}>
          {notice}
        </Alert>
      )}
      {/* Errors of actions without a modal (reactivate); the modals show their own. */}
      {error && !modalOpen && (
        <Alert variant="error" className="mb-4" focusOnMount key={error}>
          {error}
        </Alert>
      )}

      {content}

      {selected && (
        <ConfirmSubscriptionModal
          plan={selected}
          open={confirming}
          pending={pending === 'subscribe'}
          error={confirming ? error : null}
          onConfirm={handleSubscribe}
          onClose={() => setConfirming(false)}
        />
      )}
      {subscription && (
        <CancelSubscriptionModal
          subscription={subscription}
          open={canceling}
          pending={pending === 'cancel'}
          error={canceling ? error : null}
          onConfirm={handleCancel}
          onClose={() => setCanceling(false)}
        />
      )}
    </div>
  )
}
