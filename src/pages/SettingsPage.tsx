import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Address, AddressInput } from '@/types'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Card, Input, Modal, Skeleton, Tabs, type TabItem } from '@/components/ui'
import { authErrorMessage } from '@/lib/authErrors'
import { rainSaverErrorMessage } from '@/lib/apiErrors'
import { useFocusFirstError } from '@/lib/useFocusFirstError'
import { MIN_PASSWORD_LENGTH, newPasswordFieldErrors } from '@/lib/validation'
import { AddressForm, type AddressFieldErrors } from '@/components/address/AddressForm'
import { AddressTable } from '@/components/address/AddressTable'
import { PageHeader } from '@/components/layout/PageHeader'
import { createAddress, deleteAddress, listAddresses } from '@/api/rainsaver'

const EMPTY_ADDRESS: AddressInput = { cep: '', logradouro: '', bairro: '', number: '', cidade: '', estado: '' }

function AccountTab() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ current?: string; password?: string; confirmation?: string }>({})
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstError = useFocusFirstError(formRef)
  const clearError = (field: 'current' | 'password' | 'confirmation') =>
    setFieldErrors((f) => ({ ...f, [field]: undefined }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    const errors: { current?: string; password?: string; confirmation?: string } = {}
    if (!currentPassword) errors.current = 'Informe sua senha atual.'
    const passwordErrors = newPasswordFieldErrors(newPassword, confirmPassword)
    if (passwordErrors.password) errors.password = passwordErrors.password
    if (passwordErrors.confirmation) errors.confirmation = passwordErrors.confirmation
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstError()
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
        <span className="text-sm font-medium text-slate-700">E-mail</span>
        <p className="text-sm break-words text-slate-900">{user?.email}</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <h2 className="text-sm font-semibold text-slate-900">Alterar senha</h2>
        {error && (
          <Alert variant="error" focusOnMount>
            {error}
          </Alert>
        )}
        <Input
          label="Senha atual"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          error={fieldErrors.current}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            clearError('current')
          }}
        />
        <Input
          label="Nova senha"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={newPassword}
          error={fieldErrors.password}
          onChange={(e) => {
            setNewPassword(e.target.value)
            clearError('password')
          }}
        />
        <Input
          label="Confirmar nova senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          error={fieldErrors.confirmation}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            clearError('confirmation')
          }}
        />
        <p className="text-xs text-slate-600">Ao alterar a senha, todas as sessões são encerradas.</p>
        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Alterando…' : 'Alterar senha'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function validateAddress(input: AddressInput): AddressFieldErrors {
  const errors: AddressFieldErrors = {}
  if (!input.logradouro.trim()) errors.logradouro = 'Informe o logradouro, como Rua das Acácias.'
  if (!input.number.trim()) errors.number = 'Informe o número ou escreva s/n.'
  if (!input.cidade.trim()) errors.cidade = 'Informe a cidade.'
  if (input.estado.trim().length !== 2) errors.estado = 'Informe a UF com 2 letras, como PR.'
  return errors
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formValue, setFormValue] = useState<AddressInput>(EMPTY_ADDRESS)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<AddressFieldErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  const focusFirstError = useFocusFirstError(formRef)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  // Address waiting for the user to confirm its deletion.
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null)
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
    setFieldErrors({})
    setModalOpen(true)
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    const errors = validateAddress(formValue)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusFirstError()
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

  const confirmDelete = async () => {
    const address = pendingDelete
    if (!address) return
    setActionError(null)
    setDeletingId(address.id)
    try {
      await deleteAddress(address.id)
      setAddresses((list) => (list ?? []).filter((a) => a.id !== address.id))
      setPendingDelete(null)
    } catch (err) {
      setPendingDelete(null)
      setActionError(rainSaverErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  if (loadError) return <Alert variant="error">{loadError}</Alert>
  if (!addresses) {
    return (
      <div role="status" aria-busy="true" className="flex flex-col gap-3">
        <span className="sr-only">Carregando endereços…</span>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {actionError && (
        <Alert variant="error" focusOnMount>
          {actionError}
        </Alert>
      )}
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>Novo endereço</Button>
      </div>

      <AddressTable addresses={addresses} onDelete={setPendingDelete} deletingId={deletingId} />

      <Modal
        title="Novo endereço"
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            {/* The form lives in the modal body: `form` + submit lets Enter save too. */}
            <Button type="submit" form="address-form" disabled={saving}>
              {saving ? 'Localizando endereço…' : 'Salvar endereço'}
            </Button>
          </>
        }
      >
        <form ref={formRef} id="address-form" onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
          {formError && (
            <Alert variant="error" focusOnMount>
              {formError}
            </Alert>
          )}
          <AddressForm
            value={formValue}
            onChange={(value) => {
              setFormValue(value)
              setFieldErrors({})
            }}
            errors={fieldErrors}
          />
          <p className="text-xs text-slate-600">
            A localização é obtida automaticamente a partir do endereço, para escolher a estação meteorológica mais
            próxima.
          </p>
        </form>
      </Modal>

      <Modal
        title="Excluir endereço"
        open={pendingDelete !== null}
        onClose={() => deletingId === null && setPendingDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deletingId !== null}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletingId !== null}>
              {deletingId !== null ? 'Excluindo…' : 'Excluir endereço'}
            </Button>
          </>
        }
      >
        {pendingDelete && (
          <p className="text-sm text-slate-700">
            Excluir o endereço em{' '}
            <strong>
              {pendingDelete.logradouro}, {pendingDelete.number}
            </strong>
            ? Os cálculos dele também serão apagados e isso não pode ser desfeito.
          </p>
        )}
      </Modal>
    </div>
  )
}

export function SettingsPage() {
  // The tab lives in the URL (?aba=enderecos) so it can be linked and survives reload.
  const [params, setParams] = useSearchParams()
  const activeKey = params.get('aba') === 'enderecos' ? 'enderecos' : 'conta'

  const items: TabItem[] = [
    { key: 'conta', label: 'Conta', content: <AccountTab /> },
    { key: 'enderecos', label: 'Endereços', content: <AddressesTab /> },
  ]

  return (
    <div>
      <PageHeader title="Configurações" description="Gerencie sua conta e os endereços usados nos cálculos." />
      <Card>
        <Tabs items={items} activeKey={activeKey} onChange={(key) => setParams({ aba: key }, { replace: true })} />
      </Card>
    </div>
  )
}
