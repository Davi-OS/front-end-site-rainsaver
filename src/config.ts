const trimSlash = (url: string) => url.replace(/\/+$/, '')

export const AUTH_API_URL = trimSlash(import.meta.env.VITE_AUTH_API_URL ?? 'http://localhost:8080')
export const RAINSAVER_API_URL = trimSlash(import.meta.env.VITE_RAINSAVER_API_URL ?? 'http://localhost:8081')

/** Audience requested at login: tokens are scoped to the rain-saver system. */
export const AUTH_SYSTEM = 'rain-saver'
