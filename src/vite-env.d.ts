/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of go-auth-service (login, refresh, logout, /me). */
  readonly VITE_AUTH_API_URL?: string
  /** Base URL of the rain-saver backend. */
  readonly VITE_RAINSAVER_API_URL?: string
  /** 'true' shows the reserved (empty) ad slots on the home page. Off by default. */
  readonly VITE_ADS_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
