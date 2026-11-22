import { Star } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { formatBRL, formatDate } from '@/lib/format'
import type { Subscription } from '@/subscription/types'

interface SubscriptionStatusCardProps {
  subscription: Subscription
  busy: boolean
  onCancel: () => void
  onResume: () => void
}

export function SubscriptionStatusCard({ subscription, busy, onCancel, onResume }: SubscriptionStatusCardProps) {
  // The plan as contracted, not the current catalog entry (which may have changed).
  const plan = subscription.plan
  const ending = subscription.status === 'canceling'

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sun-100 text-sun-800">
            <Star className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">Plano {plan.name}</h2>
            <p className="text-sm text-slate-600 tabular-nums">
              {formatBRL(plan.priceBRL)}&nbsp;por&nbsp;{plan.period}
            </p>
            {/* While ending, the page-level alert already states the end date (and is announced). */}
            {!ending && <p className="mt-2 text-sm text-slate-700">Renova em {formatDate(subscription.periodEnd)}.</p>}
          </div>
        </div>
        {ending ? (
          <Button onClick={onResume} disabled={busy}>
            {busy ? 'Reativando…' : 'Reativar assinatura'}
          </Button>
        ) : (
          <Button variant="danger" onClick={onCancel} disabled={busy}>
            Cancelar assinatura
          </Button>
        )}
      </div>
    </Card>
  )
}
