export interface ViaCepResult {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

export class CepNotFoundError extends Error {
  constructor() {
    super('CEP não encontrado.')
  }
}

export async function lookupCep(cep: string): Promise<ViaCepResult> {
  const digits = cep.replace(/\D/g, '')
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  const data = await response.json()

  if (data.erro) {
    throw new CepNotFoundError()
  }

  return {
    logradouro: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    estado: data.uf || '',
  }
}
