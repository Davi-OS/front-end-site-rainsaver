import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Página não encontrada</h1>
      <Link to="/" className="text-brand-600 hover:underline">
        Voltar para o início
      </Link>
    </div>
  )
}
