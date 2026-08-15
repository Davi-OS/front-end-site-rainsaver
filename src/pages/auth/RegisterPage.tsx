import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AddressInput, Gender } from '@/types'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Input, Select } from '@/components/ui'
import { AddressForm } from '@/components/address/AddressForm'
import { EmailAlreadyRegisteredError } from '@/db/users'
import { isValidEmail } from '@/lib/validation'

const EMPTY_ADDRESS: AddressInput = { cep: '', logradouro: '', bairro: '', number: '', cidade: '', estado: '' }

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<Gender>('Outros')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [address, setAddress] = useState<AddressInput>(EMPTY_ADDRESS)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!isValidEmail(email)) {
      setError('Insira um email válido.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!address.cep || !address.logradouro || !address.number || !address.cidade || !address.estado) {
      setError('Preencha todos os campos do endereço.')
      return
    }

    try {
      register({ firstName, lastName, gender, email, password, confirmPassword, address })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof EmailAlreadyRegisteredError ? err.message : 'Não foi possível registrar.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-lg font-semibold text-slate-900">Criar conta</h1>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome" name="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Sobrenome" name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <Select label="Gênero" name="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
          <option value="Feminino">Feminino</option>
          <option value="Masculino">Masculino</option>
          <option value="Outros">Outros</option>
        </Select>

        <Input label="Email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Senha"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirmar senha"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-700">Endereço</h2>
          <AddressForm value={address} onChange={setAddress} />
        </div>

        <Button type="submit" fullWidth>
          Registrar
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Já tem uma conta?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
