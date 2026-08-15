import { useState } from 'react'
import type { AddressInput } from '@/types'
import { Input } from '@/components/ui'
import { isValidCep } from '@/lib/validation'
import { lookupCep } from '@/lib/viaCep'

interface AddressFormProps {
  value: AddressInput
  onChange: (value: AddressInput) => void
}

export function AddressForm({ value, onChange }: AddressFormProps) {
  const [cepError, setCepError] = useState<string | undefined>()
  const [loadingCep, setLoadingCep] = useState(false)

  const set = (field: keyof AddressInput, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleCepBlur = async () => {
    setCepError(undefined)
    if (!isValidCep(value.cep)) {
      setCepError('CEP inválido.')
      return
    }
    setLoadingCep(true)
    try {
      const result = await lookupCep(value.cep)
      onChange({
        ...value,
        logradouro: result.logradouro,
        bairro: result.bairro,
        cidade: result.cidade,
        estado: result.estado,
      })
    } catch {
      setCepError('CEP não encontrado.')
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="CEP"
        name="cep"
        value={value.cep}
        onChange={(e) => set('cep', e.target.value)}
        onBlur={handleCepBlur}
        error={cepError}
        placeholder={loadingCep ? 'Buscando...' : '00000-000'}
      />
      <Input
        label="Número"
        name="number"
        value={value.number}
        onChange={(e) => set('number', e.target.value)}
      />
      <Input
        label="Logradouro"
        name="logradouro"
        containerClassName="col-span-2"
        value={value.logradouro}
        onChange={(e) => set('logradouro', e.target.value)}
      />
      <Input
        label="Bairro"
        name="bairro"
        value={value.bairro}
        onChange={(e) => set('bairro', e.target.value)}
      />
      <Input
        label="Cidade"
        name="cidade"
        value={value.cidade}
        onChange={(e) => set('cidade', e.target.value)}
      />
      <Input
        label="Estado (UF)"
        name="estado"
        maxLength={2}
        value={value.estado}
        onChange={(e) => set('estado', e.target.value.toUpperCase())}
      />
    </div>
  )
}
