import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Input } from '@/components/ui'
import { InvalidCredentialsError } from '@/db/users'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      login({ email, password })
      const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from
      navigate(from ? `${from.pathname}${from.search}` : '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof InvalidCredentialsError ? err.message : 'Não foi possível entrar.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-lg font-semibold text-slate-900">Entrar</h1>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" fullWidth>
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Não tem uma conta?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          Registre-se
        </Link>
      </p>
    </div>
  )
}
