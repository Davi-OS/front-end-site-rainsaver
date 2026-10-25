import { ApiError, NetworkError } from '@/api/http'
import { authErrorMessage } from './authErrors'

/** User-facing message (pt-BR) for errors coming from the rain-saver API. */
export function rainSaverErrorMessage(err: unknown): string {
  if (err instanceof NetworkError) return 'Não foi possível conectar ao servidor do RainSaver.'
  if (err instanceof ApiError) {
    if (err.status === 403) return 'Sua conta não tem permissão para esta ação.'
    if (err.status === 404) return 'Endereço não encontrado.'
    if (err.status === 422) {
      return 'Não conseguimos localizar este endereço. Confira logradouro, número, cidade e UF.'
    }
    if (err.status === 503 && err.message.startsWith('geocoding')) {
      return 'O serviço de localização de endereços está indisponível. Tente novamente em instantes.'
    }
    if (err.status === 503) return 'Ainda não há dados de estações meteorológicas disponíveis.'
  }
  return authErrorMessage(err)
}
