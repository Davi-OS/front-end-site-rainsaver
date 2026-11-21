import { Trash2 } from 'lucide-react'
import type { Address } from '@/types'

interface AddressTableProps {
  addresses: Address[]
  onDelete: (address: Address) => void
  /** Id of the address being deleted, to disable its button. */
  deletingId?: string | null
}

function DeleteButton({
  address,
  onDelete,
  deleting,
}: {
  address: Address
  onDelete: (address: Address) => void
  deleting: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onDelete(address)}
      disabled={deleting}
      aria-label={`Excluir endereço ${address.logradouro}, ${address.number}`}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}

// Addresses can't be edited: calculations keep the station chosen for the
// original location. To fix one, delete it and create it again.
export function AddressTable({ addresses, onDelete, deletingId }: AddressTableProps) {
  if (addresses.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-600">
        Nenhum endereço cadastrado ainda. Adicione o primeiro para usar as calculadoras.
      </p>
    )
  }

  return (
    <>
      {/* Small screens: one card per address, no sideways scrolling. */}
      <ul className="flex flex-col gap-3 md:hidden">
        {addresses.map((address) => (
          <li
            key={address.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-slate-200 p-4 text-sm"
          >
            <div className="min-w-0">
              <p className="font-semibold break-words text-slate-900">
                {address.logradouro}, {address.number}
              </p>
              <p className="break-words text-slate-700">
                {address.bairro && `${address.bairro} · `}
                {address.cidade}/{address.estado}
              </p>
              <p className="text-slate-600 tabular-nums">CEP {address.cep}</p>
            </div>
            <DeleteButton address={address} onDelete={onDelete} deleting={deletingId === address.id} />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Endereços cadastrados</caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th scope="col" className="py-2 pr-4 font-medium">CEP</th>
              <th scope="col" className="py-2 pr-4 font-medium">Logradouro</th>
              <th scope="col" className="py-2 pr-4 font-medium">Número</th>
              <th scope="col" className="py-2 pr-4 font-medium">Bairro</th>
              <th scope="col" className="py-2 pr-4 font-medium">Cidade</th>
              <th scope="col" className="py-2 pr-4 font-medium">Estado</th>
              <th scope="col" className="py-2 font-medium">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address) => (
              <tr key={address.id} className="border-b border-slate-100">
                <td className="py-1 pr-4 whitespace-nowrap text-slate-700 tabular-nums">{address.cep}</td>
                <td className="max-w-56 py-1 pr-4 break-words text-slate-700">{address.logradouro}</td>
                <td className="py-1 pr-4 text-slate-700">{address.number}</td>
                <td className="max-w-40 py-1 pr-4 break-words text-slate-700">{address.bairro}</td>
                <td className="max-w-40 py-1 pr-4 break-words text-slate-700">{address.cidade}</td>
                <td className="py-1 pr-4 text-slate-700">{address.estado}</td>
                <td className="py-1">
                  <DeleteButton address={address} onDelete={onDelete} deleting={deletingId === address.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
