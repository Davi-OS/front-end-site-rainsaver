import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PasswordChangeRequiredError } from '@/api/auth'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Input } from '@/components/ui'
import { authErrorMessage } from '@/lib/authErrors'
import { isValidEmail, MIN_PASSWORD_LENGTH, newPasswordError } from '@/lib/validation'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.')
      return
    }
    const invalid = newPasswordError(password, confirmPassword, 'senha')
    if (invalid) {
      setError(invalid)
      return
    }
    setSubmitting(true)
    try {
      await signup(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // An existing account (created by an admin) still on its initial
      // password: the login page walks through replacing it.
      setError(
        err instanceof PasswordChangeRequiredError
          ? 'Sua conta tem uma senha provisória. Entre pela tela de login para definir a sua.'
          : authErrorMessage(err),
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-lg font-semibold text-slate-900">Criar conta</h1>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          Pelo menos {MIN_PASSWORD_LENGTH} caracteres. Já usa outro sistema com este e-mail? Use a mesma senha.
        </p>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-medium text-brand-700 underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
