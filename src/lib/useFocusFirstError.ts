import { useCallback, useEffect, useState, type RefObject } from 'react'

/**
 * Returns a function to call right after a submit that produced field errors:
 * once they are rendered, focus moves to the first invalid control of the form
 * (the ones Input/Select mark aria-invalid). It deliberately does not react to
 * the errors themselves, so clearing one while typing never steals focus.
 */
export function useFocusFirstError(formRef: RefObject<HTMLFormElement | null>): () => void {
  const [requests, setRequests] = useState(0)

  useEffect(() => {
    if (requests > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [requests, formRef])

  return useCallback(() => setRequests((n) => n + 1), [])
}
