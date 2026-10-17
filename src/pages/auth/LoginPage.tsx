import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OrgRequiredError, type OrgChoice } from '@/api/auth'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Input, Select } from '@/components/ui'
import { authErrorMessage } from '@/lib/authErrors'

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
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password, org: org || undefined })
      const from = state?.from
      navigate(from ? `${from.pathname}${from.search}` : '/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof OrgRequiredError && err.orgs.length > 0) {
        // The account belongs to several organizations: pick one and resubmit.
        setOrgs(err.orgs)
        setOrg(err.orgs[0].id)
      } else {
        setError(authErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-lg font-semibold text-slate-900">Entrar</h1>

      {notice && !error && <Alert variant="info">{notice}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setOrgs(null)
            setOrg('')
          }}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Não tem uma conta? Peça acesso ao administrador da sua organização.
      </p>
    </div>
  )
}
