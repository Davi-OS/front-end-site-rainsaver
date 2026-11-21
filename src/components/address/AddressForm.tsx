import { useState } from 'react'
import type { AddressInput } from '@/types'
import { Input } from '@/components/ui'
import { isValidCep } from '@/lib/validation'
import { lookupCep } from '@/lib/viaCep'

export type AddressFieldErrors = Partial<Record<keyof AddressInput, string>>

interface AddressFormProps {
  value: AddressInput
  onChange: (value: AddressInput) => void
  /** Problems found on submit, shown next to each field. */
  errors?: AddressFieldErrors
}

export function AddressForm({ value, onChange, errors = {} }: AddressFormProps) {
  const [cepError, setCepError] = useState<string | undefined>()
  const [loadingCep, setLoadingCep] = useState(false)

  const set = (field: keyof AddressInput, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleCepBlur = async () => {
    setCepError(undefined)
    if (!isValidCep(value.cep)) {
      setCepError('CEP inválido. Informe os 8 dígitos, como 80210-000.')
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
      setCepError('CEP não encontrado. Confira os números ou preencha o endereço abaixo.')
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="CEP"
        name="cep"
        inputMode="numeric"
        autoComplete="postal-code"
        value={value.cep}
        onChange={(e) => set('cep', e.target.value)}
        onBlur={handleCepBlur}
        error={cepError ?? errors.cep}
        placeholder={loadingCep ? 'Buscando…' : 'Exemplo: 80210-000…'}
      />
      <Input
        label="Número"
        name="number"
        autoComplete="off"
        error={errors.number}
        value={value.number}
        onChange={(e) => set('number', e.target.value)}
      />
      <Input
        label="Logradouro"
        name="logradouro"
        autoComplete="address-line1"
        error={errors.logradouro}
        containerClassName="sm:col-span-2"
        value={value.logradouro}
        onChange={(e) => set('logradouro', e.target.value)}
      />
      <Input
        label="Bairro"
        name="bairro"
        autoComplete="off"
        value={value.bairro}
        onChange={(e) => set('bairro', e.target.value)}
      />
      <Input
        label="Cidade"
        name="cidade"
        autoComplete="address-level2"
        error={errors.cidade}
        value={value.cidade}
        onChange={(e) => set('cidade', e.target.value)}
      />
      <Input
        label="Estado (UF)"
        name="estado"
        autoComplete="address-level1"
        error={errors.estado}
        maxLength={2}
        value={value.estado}
        onChange={(e) => set('estado', e.target.value.toUpperCase())}
      />
    </div>
  )
}
