import { Loader2 } from 'lucide-react'

/** Spinner for the content area (inside the app shell), unlike FullPageSpinner. */
export function PageSpinner() {
  return (
    <div className="flex justify-center py-24 text-slate-600" role="status">
      <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
