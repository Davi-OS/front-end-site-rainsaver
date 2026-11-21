import { useEffect, useState } from 'react'
import { NetworkError } from '@/api/http'
import { listPlans } from '@/api/rainsaver'
import { SUBSCRIPTION_MODE } from '@/config'
import { rainSaverErrorMessage } from '@/lib/apiErrors'
import type { Plan } from './types'

interface PlansState {
  plans: Plan[] | null
  error: string | null
  loading: boolean
  /** Counts failed attempts, so a repeated failure can be announced again. */
  failures: number
}

// Not rainSaverErrorMessage for everything: it reads a 404 as "address not found".
function plansErrorMessage(err: unknown): string {
  if (err instanceof NetworkError) return rainSaverErrorMessage(err)
  return 'Não foi possível carregar os planos agora. Tente de novo em instantes.'
}

/**
 * The plans and prices offered by the backend (`GET /planos`, public). Loaded
 * when the component mounts; `reload` tries again after a failure, keeping the
 * previous error on screen until the new attempt answers (so the retry button
 * does not vanish under the user's focus). Nothing is fetched while the
 * subscription feature is off.
 */
export function usePlans() {
  const [state, setState] = useState<PlansState>({
    plans: null,
    error: null,
    loading: SUBSCRIPTION_MODE !== 'off',
    failures: 0,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (SUBSCRIPTION_MODE === 'off') return
    let cancelled = false
    listPlans()
      .then((plans) => !cancelled && setState((s) => ({ ...s, plans, error: null, loading: false })))
      .catch(
        (err) =>
          !cancelled &&
          setState((s) => ({ ...s, plans: null, error: plansErrorMessage(err), loading: false, failures: s.failures + 1 })),
      )
    return () => {
      cancelled = true
    }
  }, [attempt])

  return {
    plans: state.plans,
    loading: state.loading,
    error: state.error,
    failures: state.failures,
    reload: () => {
      setState((s) => ({ ...s, loading: true }))
      setAttempt((n) => n + 1)
    },
  }
}
