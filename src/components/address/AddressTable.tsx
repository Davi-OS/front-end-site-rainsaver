import { Pencil, Trash2 } from 'lucide-react'
import type { Address } from '@/types'

interface AddressTableProps {
  addresses: Address[]
  onEdit: (address: Address) => void
  onDelete: (address: Address) => void
}

export function AddressTable({ addresses, onEdit, onDelete }: AddressTableProps) {
  if (addresses.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">Nenhum endereço cadastrado ainda.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2 pr-4 font-medium">CEP</th>
            <th className="py-2 pr-4 font-medium">Logradouro</th>
            <th className="py-2 pr-4 font-medium">Número</th>
            <th className="py-2 pr-4 font-medium">Cidade</th>
            <th className="py-2 pr-4 font-medium">Estado</th>
            <th className="py-2 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((address) => (
            <tr key={address.id} className="border-b border-slate-100">
              <td className="py-2 pr-4 text-slate-700">{address.cep}</td>
              <td className="py-2 pr-4 text-slate-700">{address.logradouro}</td>
              <td className="py-2 pr-4 text-slate-700">{address.number}</td>
              <td className="py-2 pr-4 text-slate-700">{address.cidade}</td>
              <td className="py-2 pr-4 text-slate-700">{address.estado}</td>
              <td className="py-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(address)}
                    aria-label="Editar endereço"
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(address)}
                    aria-label="Excluir endereço"
                    className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
