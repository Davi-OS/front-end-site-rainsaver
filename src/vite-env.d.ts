/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of go-auth-service (login, refresh, logout, /me). */
  readonly VITE_AUTH_API_URL?: string
  /** Base URL of the rain-saver backend. */
  readonly VITE_RAINSAVER_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
