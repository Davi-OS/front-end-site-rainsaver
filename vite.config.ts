import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // src/config.ts falls back to localhost: a production bundle without the
  // auth URL would be published pointing at the developer's machine.
  if (command === 'build' && mode === 'production' && !loadEnv(mode, process.cwd(), 'VITE_').VITE_AUTH_API_URL) {
    throw new Error('VITE_AUTH_API_URL must be set for production builds (see .env.example)')
  }
  return {
    // GitHub Pages serves this project from /front-end-site-rainsaver/, so only
    // prefix the base path for production builds — the dev server stays at "/".
    base: command === 'build' ? '/front-end-site-rainsaver/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
