import { SUBSCRIPTION_MODE } from '@/config'
import { SubscriptionError, type SubscriptionClient } from './client'
import { MOCK_STORAGE_PREFIX, mockSubscriptionClient } from './mockClient'
import type { Plan, Subscription } from './types'

export type SubscriptionAction = 'subscribe' | 'cancel' | 'resume'

export interface SubscriptionState {
  /** Whose state this is (null: no one is logged in). */
  userId: string | null
  /** False until the user's subscription has been loaded, so ads never flash for a subscriber. */
  ready: boolean
  subscription: Subscription | null
  pending: SubscriptionAction | null
  error: string | null
}

// The one place that picks the implementation. A live billing client replaces
// the mock here later.
const client: SubscriptionClient | null = SUBSCRIPTION_MODE === 'mock' ? mockSubscriptionClient : null

let state: SubscriptionState = { userId: null, ready: true, subscription: null, pending: null, error: null }
const listeners = new Set<() => void>()

function setState(next: Partial<SubscriptionState>): void {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

async function load(userId: string): Promise<void> {
  if (!client) return
  let subscription: Subscription | null = null
  try {
    subscription = await client.get(userId)
  } catch {
    // Treat a failed read as "no subscription": the user can retry from the page.
  }
  if (state.userId === userId) setState({ subscription, ready: true })
}

export const subscriptionStore = {
  getState: (): SubscriptionState => state,

  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  /** Points the store at the logged-in user (or null). Idempotent. */
  syncUser(userId: string | null): void {
    if (state.userId === userId) return
    setState({ userId, ready: !userId || !client, subscription: null, pending: null, error: null })
    if (userId) void load(userId)
  },

  clearError(): void {
    if (state.error) setState({ error: null })
  },

  /** Runs an action for the current user. Resolves true on success; failures land in `error`. */
  async run(action: SubscriptionAction, plan?: Plan): Promise<boolean> {
    const userId = state.userId
    if (!client || !userId || state.pending) return false
    setState({ pending: action, error: null })
    try {
      const subscription =
        action === 'subscribe' && plan
          ? await client.subscribe(userId, plan)
          : action === 'cancel'
            ? await client.cancel(userId)
            : await client.resume(userId)
      if (state.userId === userId) setState({ subscription, pending: null })
      return true
    } catch (err) {
      const message = err instanceof SubscriptionError ? err.message : 'Algo deu errado. Tente novamente.'
      if (state.userId === userId) setState({ pending: null, error: message })
      return false
    }
  },
}

// Another tab changed this user's mock subscription: reload it here.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    const userId = state.userId
    if (userId && event.key === `${MOCK_STORAGE_PREFIX}${userId}`) void load(userId)
  })
}
