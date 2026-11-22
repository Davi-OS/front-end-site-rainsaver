import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '@/auth/useAuth'
import { SUBSCRIPTION_MODE } from '@/config'
import { subscriptionStore } from './store'
import { tokenSaysSubscriber } from './token'
import type { Plan } from './types'

/**
 * The subscription as the UI sees it. `isSubscriber` is true when the access
 * token carries the subscriber permission (the real path) or, in mock mode,
 * when the local fake has an active or ending subscription for this user.
 * `ready` is false while that is still being determined: show neither ads nor
 * "subscribe" prompts until it is true.
 */
export function useSubscription() {
  const { user, status } = useAuth()
  const userId = user?.id ?? null
  const state = useSyncExternalStore(subscriptionStore.subscribe, subscriptionStore.getState)

  useEffect(() => {
    subscriptionStore.syncUser(userId)
  }, [userId])

  // The store may still hold the previous user (or nobody) for a render or two.
  const mine = state.userId === userId
  const subscription = mine ? state.subscription : null
  const isSubscriber = tokenSaysSubscriber() || (SUBSCRIPTION_MODE === 'mock' && subscription !== null)

  return {
    mode: SUBSCRIPTION_MODE,
    ready: status !== 'loading' && mine && state.ready,
    isSubscriber,
    /** Present only when a subscription is managed here (mock now, billing service later). */
    subscription,
    pending: mine ? state.pending : null,
    error: mine ? state.error : null,
    clearError: subscriptionStore.clearError,
    subscribe: (plan: Plan) => subscriptionStore.run('subscribe', plan),
    cancel: () => subscriptionStore.run('cancel'),
    resume: () => subscriptionStore.run('resume'),
  }
}
