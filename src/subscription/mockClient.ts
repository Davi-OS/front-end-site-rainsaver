import { SUBSCRIPTION_MOCK_FAIL } from '@/config'
import { SubscriptionError, type SubscriptionClient } from './client'
import type { Plan, PlanInterval, Subscription } from './types'

// Browser-only fake of the billing service: state lives in localStorage, per
// user, so it survives reloads. No money, no network, no real account change.

// v2: the stored shape changed (a plan snapshot instead of a plan id). Old v1 entries are ignored.
export const MOCK_STORAGE_PREFIX = 'rainsaver:mock-subscription:v2:'
const LATENCY_MS = 600
const DAY_MS = 24 * 60 * 60 * 1000
// How long a billing period lasts in this fake. A real backend decides renewals.
const INTERVAL_DAYS: Record<PlanInterval, number> = { month: 30, year: 365 }

const key = (userId: string) => `${MOCK_STORAGE_PREFIX}${userId}`
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const addDays = (from: number, days: number) => new Date(from + days * DAY_MS).toISOString()

function load(userId: string): Subscription | null {
  try {
    const raw = localStorage.getItem(key(userId))
    const parsed = raw ? (JSON.parse(raw) as Partial<Subscription>) : null
    return parsed?.plan && parsed.periodEnd && parsed.status ? (parsed as Subscription) : null
  } catch {
    return null
  }
}

function save(userId: string, subscription: Subscription | null): void {
  try {
    if (subscription) localStorage.setItem(key(userId), JSON.stringify(subscription))
    else localStorage.removeItem(key(userId))
  } catch {
    // Storage unavailable (private mode): the action still "worked" for this tab only.
  }
}

/** Applies the passage of time: a finished cancellation ends, an active plan renews. */
function settle(userId: string, subscription: Subscription | null): Subscription | null {
  if (!subscription || new Date(subscription.periodEnd).getTime() > Date.now()) return subscription
  if (subscription.status === 'canceling') {
    save(userId, null)
    return null
  }
  const renewed = { ...subscription, periodEnd: addDays(Date.now(), INTERVAL_DAYS[subscription.plan.interval]) }
  save(userId, renewed)
  return renewed
}

async function maybeFail(action: 'subscribe' | 'cancel' | 'resume'): Promise<void> {
  await sleep(LATENCY_MS)
  if (SUBSCRIPTION_MOCK_FAIL === action) {
    throw new SubscriptionError('Não foi possível concluir agora (simulação de falha). Tente novamente.')
  }
}

export const mockSubscriptionClient: SubscriptionClient = {
  async get(userId) {
    return settle(userId, load(userId))
  },

  async subscribe(userId, plan: Plan) {
    await maybeFail('subscribe')
    if (settle(userId, load(userId))) throw new SubscriptionError('Você já tem uma assinatura ativa.')
    const now = Date.now()
    const subscription: Subscription = {
      plan: { id: plan.id, name: plan.name, priceBRL: plan.priceBRL, interval: plan.interval, period: plan.period },
      status: 'active',
      startedAt: new Date(now).toISOString(),
      periodEnd: addDays(now, INTERVAL_DAYS[plan.interval]),
    }
    save(userId, subscription)
    return subscription
  },

  async cancel(userId) {
    await maybeFail('cancel')
    const current = settle(userId, load(userId))
    if (!current) throw new SubscriptionError('Você não tem uma assinatura para cancelar.')
    const updated: Subscription = { ...current, status: 'canceling' }
    save(userId, updated)
    return updated
  },

  async resume(userId) {
    await maybeFail('resume')
    const current = settle(userId, load(userId))
    if (!current) throw new SubscriptionError('Sua assinatura já terminou. Assine de novo para continuar sem anúncios.')
    const updated: Subscription = { ...current, status: 'active' }
    save(userId, updated)
    return updated
  },
}
