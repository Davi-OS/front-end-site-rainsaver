/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of go-auth-service (login, refresh, logout, /me). */
  readonly VITE_AUTH_API_URL?: string
  /** Base URL of the rain-saver backend. */
  readonly VITE_RAINSAVER_API_URL?: string
  /** 'true' shows the reserved (empty) ad slots on the home page. Off by default. */
  readonly VITE_ADS_ENABLED?: string
  /** 'mock' turns on the subscription screens backed by a browser-only fake. Off by default. */
  readonly VITE_SUBSCRIPTION_MODE?: string
  /** Mock only: 'subscribe' | 'cancel' | 'resume' makes that action fail, to test error states. */
  readonly VITE_SUBSCRIPTION_MOCK_FAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
