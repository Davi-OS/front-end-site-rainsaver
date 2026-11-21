import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PasswordChangeRequiredError } from '@/api/auth'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Input } from '@/components/ui'
import { authErrorMessage } from '@/lib/authErrors'
import { useFocusFirstError } from '@/lib/useFocusFirstError'
import { usePageTitle } from '@/lib/usePageTitle'
import { isValidEmail, MIN_PASSWORD_LENGTH, newPasswordFieldErrors } from '@/lib/validation'

interface FieldErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

export function SignupPage() {
  usePageTitle('Criar conta')
  const { signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstError = useFocusFirstError(formRef)
  const clearError = (field: keyof FieldErrors) => setFieldErrors((f) => ({ ...f, [field]: undefined }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const errors: FieldErrors = {}
    if (!isValidEmail(email)) errors.email = 'Informe um e-mail válido, como nome@exemplo.com.'
    const passwordErrors = newPasswordFieldErrors(password, confirmPassword, 'senha')
    if (passwordErrors.password) errors.password = passwordErrors.password
    if (passwordErrors.confirmation) errors.confirmPassword = passwordErrors.confirmation
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstError()
      return
    }
    setSubmitting(true)
    try {
      await signup(email.trim(), password)
      navigate(from ? `${from.pathname}${from.search}` : '/', { replace: true })
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
      <h1 className="text-center text-2xl font-semibold text-slate-900">Criar conta</h1>

      {error && (
        <Alert variant="error" focusOnMount>
          {error}
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearError('email')
          }}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError('password')
          }}
        />
        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            clearError('confirmPassword')
          }}
        />
        <p className="text-xs text-slate-600">
          Pelo menos {MIN_PASSWORD_LENGTH} caracteres. Já usa outro sistema com este e-mail? Use a mesma senha.
        </p>
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Já tem uma conta?{' '}
        <Link to="/login" state={location.state} className="font-semibold text-brand-700 underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
