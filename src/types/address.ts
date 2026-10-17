/** An endereco as stored by the rain-saver backend. */
export interface Address {
  id: string
  cep: string
  logradouro: string
  bairro: string
  number: string
  cidade: string
  estado: string
  /** Geocoded by the backend when the address is created. */
  latitude: number
  longitude: number
  createdAt: string
}

/** What the user types; coordinates are resolved by the backend. */
export type AddressInput = Pick<Address, 'cep' | 'logradouro' | 'bairro' | 'number' | 'cidade' | 'estado'>
