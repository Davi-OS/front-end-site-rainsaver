export interface Address {
  id: string
  userId: string
  cep: string
  logradouro: string
  bairro: string
  number: string
  cidade: string
  estado: string
}

export type AddressInput = Omit<Address, 'id' | 'userId'>
