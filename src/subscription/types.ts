/** Defined by the backend (`GET /planos`), e.g. "mensal". */
export type PlanId = string

export type PlanInterval = 'month' | 'year'

/** A plan offered by the backend. The front only displays it. */
export interface Plan {
  id: PlanId
  name: string
  priceBRL: number
  interval: PlanInterval
  /** "mês" or "ano": completes "R$ 9,90 por ___". */
  period: string
  /** Short marketing label chosen by the backend, e.g. "Mais econômico". */
  highlight?: string
}

/**
 * The plan as it was contracted (name and price at purchase time). The catalog
 * can change later without altering an existing subscription, so the
 * subscription keeps its own copy instead of looking the plan up again.
 */
export type PlanSnapshot = Pick<Plan, 'id' | 'name' | 'priceBRL' | 'interval' | 'period'>

export type SubscriptionStatus = 'active' | 'canceling'

export interface Subscription {
  plan: PlanSnapshot
  status: SubscriptionStatus
  startedAt: string
  /** ISO date. Active: the next renewal. Canceling: when the access ends. */
  periodEnd: string
}
