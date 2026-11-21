import { useEffect } from 'react'

const APP_NAME = 'RainSaver'

/** Sets the document title for the current page ("Page · RainSaver"). SPA route changes don't reload it. */
export function usePageTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`
  }, [title])
}
