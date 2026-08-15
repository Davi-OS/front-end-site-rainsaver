import { useState, type FormEvent } from 'react'
import type { Address, AddressInput } from '@/types'
import { useAuth } from '@/auth/useAuth'
import { Button, Card, Input, Modal, Tabs, type TabItem } from '@/components/ui'
import { AddressForm } from '@/components/address/AddressForm'
import { AddressTable } from '@/components/address/AddressTable'
import { createAddress, deleteAddress, listAddressesByUser, updateAddress } from '@/db/addresses'

const EMPTY_ADDRESS: AddressInput = { cep: '', logradouro: '', bairro: '', number: '', cidade: '', estado: '' }

function ProfileTab() {
  const { user, updateProfile } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [saved, setSaved] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    updateProfile({ firstName, lastName })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <Input label="Nome" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <Input label="Sobrenome" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <div className="flex items-center gap-3">
        <Button type="submit">Salvar</Button>
        {saved && <span className="text-sm text-emerald-600">Salvo!</span>}
      </div>
    </form>
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
  const [activeKey, setActiveKey] = useState('profile')

  const items: TabItem[] = [
    { key: 'profile', label: 'Perfil', content: <ProfileTab /> },
    { key: 'addresses', label: 'Endereços', content: <AddressesTab /> },
  ]

  return (
    <Card>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Configurações</h1>
      <Tabs items={items} activeKey={activeKey} onChange={setActiveKey} />
    </Card>
  )
}
