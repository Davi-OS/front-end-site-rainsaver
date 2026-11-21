import type { Plan, Subscription } from './types'

/** An action on the subscription failed (the message is shown to the user). */
export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SubscriptionError'
  }
}

/**
 * The seam to the billing backend. Today only the browser-only mock implements
 * it; a "live" client (hosted checkout, webhooks) plugs in here later without
 * touching the screens.
 */
export interface SubscriptionClient {
  /** The user's current subscription, or null when they have none (or it ended). */
  get(userId: string): Promise<Subscription | null>
  /** Starts the plan; the subscription keeps a snapshot of it as contracted. */
  subscribe(userId: string, plan: Plan): Promise<Subscription>
  /** Schedules the end at the current period's close; access continues until then. */
  cancel(userId: string): Promise<Subscription>
  /** Undoes a scheduled cancellation. */
  resume(userId: string): Promise<Subscription>
}
