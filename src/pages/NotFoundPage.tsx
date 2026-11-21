import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { usePageTitle } from '@/lib/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Página não encontrada')
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas p-4 text-center">
      <Logo />
      <div>
        <p className="font-display text-6xl font-semibold text-brand-700" aria-hidden="true">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Página não encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">O endereço que você abriu não existe ou foi movido.</p>
      </div>
      <Link
        to="/"
        className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        Voltar para o início
      </Link>
    </main>
  )
}
