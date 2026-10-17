import { useState, type FormEvent } from 'react'
import type { Address, AddressInput } from '@/types'
import { useAuth } from '@/auth/useAuth'
import { Alert, Button, Card, Input, Modal, Tabs, type TabItem } from '@/components/ui'
import { authErrorMessage } from '@/lib/authErrors'
import { AddressForm } from '@/components/address/AddressForm'
import { AddressTable } from '@/components/address/AddressTable'
import { createAddress, deleteAddress, listAddressesByUser, updateAddress } from '@/db/addresses'

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

function AddressesTab() {
  const { user } = useAuth()
  const userId = user!.id
  const [addresses, setAddresses] = useState<Address[]>(() => listAddressesByUser(userId))
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formValue, setFormValue] = useState<AddressInput>(EMPTY_ADDRESS)

  const openCreateModal = () => {
    setEditingAddress(null)
    setFormValue(EMPTY_ADDRESS)
    setModalOpen(true)
  }

  const openEditModal = (address: Address) => {
    setEditingAddress(address)
    setFormValue(address)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (editingAddress) {
      updateAddress(editingAddress.id, formValue)
    } else {
      createAddress(userId, formValue)
    }
    setAddresses(listAddressesByUser(userId))
    setModalOpen(false)
  }

  const handleDelete = (address: Address) => {
    if (!confirm(`Excluir o endereço em ${address.logradouro}, ${address.number}?`)) return
    deleteAddress(address.id)
    setAddresses(listAddressesByUser(userId))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateModal}>Novo endereço</Button>
      </div>

      <AddressTable addresses={addresses} onEdit={openEditModal} onDelete={handleDelete} />

      <Modal
        title={editingAddress ? 'Editar endereço' : 'Novo endereço'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </>
        }
      >
        <AddressForm value={formValue} onChange={setFormValue} />
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
