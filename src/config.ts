const trimSlash = (url: string) => url.replace(/\/+$/, '')

export const AUTH_API_URL = trimSlash(import.meta.env.VITE_AUTH_API_URL ?? 'http://localhost:8080')
export const RAINSAVER_API_URL = trimSlash(import.meta.env.VITE_RAINSAVER_API_URL ?? 'http://localhost:8081')

/** Audience requested at login: tokens are scoped to the rain-saver system. */
export const AUTH_SYSTEM = 'rain-saver'

/**
 * Ad slots are reserved in the layout but stay off (and render nothing) until
 * this is 'true'. Turning it on only shows the empty reserved box: no ad
 * script is loaded by the app yet.
 */
export const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED === 'true'

/**
 * Subscription feature switch. `off` (default, and what production builds get
 * unless they set it): no subscription UI and nobody is a subscriber through
 * the mock. `mock`: the "Assinatura" screens work against a local, browser-only
 * fake (see src/subscription/mockClient.ts), for demos and development.
 */
export type SubscriptionMode = 'off' | 'mock'
export const SUBSCRIPTION_MODE: SubscriptionMode = import.meta.env.VITE_SUBSCRIPTION_MODE === 'mock' ? 'mock' : 'off'

/** Permission in the access token (`perms`) that marks a subscriber. Issued by the auth service (later stage). */
export const SUBSCRIBER_PERMISSION = 'plan:subscriber'

/** Mock only: make this action fail, to exercise the error states (subscribe | cancel | resume). */
export const SUBSCRIPTION_MOCK_FAIL = import.meta.env.VITE_SUBSCRIPTION_MOCK_FAIL
