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
