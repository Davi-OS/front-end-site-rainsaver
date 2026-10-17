import { useEffect, useState, type FormEvent } from 'react'
import type { Address, AddressInput } from '@/types'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Card, Input, Modal, Tabs, type TabItem } from '@/components/ui'
import { authErrorMessage } from '@/lib/authErrors'
import { rainSaverErrorMessage } from '@/lib/apiErrors'
import { AddressForm } from '@/components/address/AddressForm'
import { AddressTable } from '@/components/address/AddressTable'
import { createAddress, deleteAddress, listAddresses } from '@/api/rainsaver'

const EMPTY_ADDRESS: AddressInput = { cep: '', logradouro: '', bairro: '', number: '', cidade: '', estado: '' }

const MIN_PASSWORD_LENGTH = 10

function AccountTab() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('A confirmação não confere com a nova senha.')
      return
    }
    setSubmitting(true)
    try {
      // On success the session ends and the route guard redirects to /login.
      await changePassword(currentPassword, newPassword)
    } catch (err) {
      setError(authErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="flex max-w-sm flex-col gap-6">
      <div>
        <span className="text-sm font-medium text-slate-700">Email</span>
        <p className="text-sm text-slate-900">{user?.email}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-900">Alterar senha</h2>
        {error && <Alert variant="error">{error}</Alert>}
        <Input
          label="Senha atual"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="Nova senha"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="Confirmar nova senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <p className="text-xs text-slate-500">Ao alterar a senha, todas as sessões são encerradas.</p>
        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Alterando…' : 'Alterar senha'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function validateAddress(input: AddressInput): string | null {
  if (!input.logradouro.trim() || !input.number.trim()) return 'Informe o logradouro e o número.'
  if (!input.cidade.trim() || input.estado.trim().length !== 2) return 'Informe a cidade e a UF (2 letras).'
  return null
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formValue, setFormValue] = useState<AddressInput>(EMPTY_ADDRESS)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listAddresses()
      .then((list) => !cancelled && setAddresses(list))
      .catch((err) => !cancelled && setLoadError(rainSaverErrorMessage(err)))
    return () => {
      cancelled = true
    }
  }, [])

  const openCreateModal = () => {
    setFormValue(EMPTY_ADDRESS)
    setFormError(null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const invalid = validateAddress(formValue)
    if (invalid) {
      setFormError(invalid)
      return
    }
    setFormError(null)
    setSaving(true)
    try {
      const created = await createAddress(formValue)
      setAddresses((list) => [created, ...(list ?? [])])
      setModalOpen(false)
    } catch (err) {
      setFormError(rainSaverErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (address: Address) => {
    if (!confirm(`Excluir o endereço em ${address.logradouro}, ${address.number}? Os cálculos dele também serão apagados.`)) return
    setActionError(null)
    setDeletingId(address.id)
    try {
      await deleteAddress(address.id)
      setAddresses((list) => (list ?? []).filter((a) => a.id !== address.id))
    } catch (err) {
      setActionError(rainSaverErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  if (loadError) return <Alert variant="error">{loadError}</Alert>
  if (!addresses) return <p className="py-8 text-center text-sm text-slate-500">Carregando endereços…</p>

  return (
    <div className="flex flex-col gap-4">
      {actionError && <Alert variant="error">{actionError}</Alert>}
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>Novo endereço</Button>
      </div>

      <AddressTable addresses={addresses} onDelete={handleDelete} deletingId={deletingId} />

      <Modal
        title="Novo endereço"
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Localizando endereço…' : 'Salvar'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && <Alert variant="error">{formError}</Alert>}
          <AddressForm value={formValue} onChange={setFormValue} />
          <p className="text-xs text-slate-500">
            A localização é obtida automaticamente a partir do endereço, para escolher a estação meteorológica mais
            próxima.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export function SettingsPage() {
  const [activeKey, setActiveKey] = useState('account')

  const items: TabItem[] = [
    { key: 'account', label: 'Conta', content: <AccountTab /> },
    { key: 'addresses', label: 'Endereços', content: <AddressesTab /> },
  ]

  return (
    <Card>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Configurações</h1>
      <Tabs items={items} activeKey={activeKey} onChange={setActiveKey} />
    </Card>
  )
}
