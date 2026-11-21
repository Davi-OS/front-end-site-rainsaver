import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { changePasswordWithCredentials, OrgRequiredError, PasswordChangeRequiredError, type OrgChoice } from '@/api/auth'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Input, Select } from '@/components/ui'
import { authErrorMessage } from '@/lib/authErrors'
import { useFocusFirstError } from '@/lib/useFocusFirstError'
import { usePageTitle } from '@/lib/usePageTitle'
import { isValidEmail, MIN_PASSWORD_LENGTH, newPasswordFieldErrors } from '@/lib/validation'

interface FieldErrors {
  email?: string
  password?: string
  newPassword?: string
  confirmPassword?: string
}

interface LoginLocationState {
  from?: { pathname: string; search: string }
}

export function LoginPage() {
  const { login, notice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LoginLocationState | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgs, setOrgs] = useState<OrgChoice[] | null>(null)
  const [org, setOrg] = useState('')
  // Set when login answered password_change_required: the form asks for a new
  // password, sets it through /password/change and logs in with it.
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  usePageTitle(mustChangePassword ? 'Definir nova senha' : 'Entrar')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstError = useFocusFirstError(formRef)
  const clearError = (field: keyof FieldErrors) => setFieldErrors((f) => ({ ...f, [field]: undefined }))

  const logIn = async (pass: string) => {
    try {
      await login({ email, password: pass, org: org || undefined })
      const from = state?.from
      navigate(from ? `${from.pathname}${from.search}` : '/', { replace: true })
    } catch (err) {
      if (err instanceof OrgRequiredError && err.orgs.length > 0) {
        // The account belongs to several organizations: pick one and resubmit.
        setOrgs(err.orgs)
        setOrg(err.orgs[0].id)
      } else if (err instanceof PasswordChangeRequiredError) {
        setMustChangePassword(true)
      } else {
        setError(authErrorMessage(err))
      }
    }
  }

  const changePasswordAndLogIn = async () => {
    try {
      await changePasswordWithCredentials(email, password, newPassword)
    } catch (err) {
      setError(authErrorMessage(err))
      return
    }
    // The new password is now the current one, even if the login below fails.
    setPassword(newPassword)
    setMustChangePassword(false)
    setNewPassword('')
    setConfirmPassword('')
    await logIn(newPassword)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    const errors: FieldErrors = {}
    if (!isValidEmail(email)) errors.email = 'Informe um e-mail válido, como nome@exemplo.com.'
    if (!password) errors.password = mustChangePassword ? 'Informe a senha atual.' : 'Informe sua senha.'
    if (mustChangePassword) {
      const passwordErrors = newPasswordFieldErrors(newPassword, confirmPassword)
      if (passwordErrors.password) errors.newPassword = passwordErrors.password
      if (passwordErrors.confirmation) errors.confirmPassword = passwordErrors.confirmation
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstError()
      return
    }

    setSubmitting(true)
    try {
      await (mustChangePassword ? changePasswordAndLogIn() : logIn(password))
    } finally {
      setSubmitting(false)
    }
  }

  const resetSteps = () => {
    setOrgs(null)
    setOrg('')
    setMustChangePassword(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-2xl font-semibold text-slate-900">
        {mustChangePassword ? 'Defina sua nova senha' : 'Entrar'}
      </h1>

      {mustChangePassword && !error && (
        <Alert variant="info">Sua senha foi definida pelo administrador. Escolha uma nova para continuar.</Alert>
      )}
      {notice && !error && !mustChangePassword && <Alert variant="info">{notice}</Alert>}
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
            resetSteps()
          }}
        />
        <Input
          label={mustChangePassword ? 'Senha atual' : 'Senha'}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value)
            clearError('password')
            setMustChangePassword(false)
          }}
        />
        {mustChangePassword && (
          <>
            <Input
              label="Nova senha"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              value={newPassword}
              error={fieldErrors.newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                clearError('newPassword')
              }}
            />
            <Input
              label="Confirmar nova senha"
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
          </>
        )}
        {orgs && (
          <Select label="Organização" name="org" value={org} onChange={(e) => setOrg(e.target.value)}>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
        )}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Entrando…' : mustChangePassword ? 'Alterar senha e entrar' : 'Entrar'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Não tem uma conta?{' '}
        <Link to="/cadastro" state={location.state} className="font-semibold text-brand-700 underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
