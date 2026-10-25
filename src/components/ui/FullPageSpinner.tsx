import { Loader2 } from 'lucide-react'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500" role="status">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
