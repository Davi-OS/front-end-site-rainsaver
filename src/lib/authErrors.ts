import { OrgRequiredError } from '@/api/auth'
import { ApiError, NetworkError } from '@/api/http'
import { SessionExpiredError } from '@/api/session'
import { NoAccessError } from '@/auth/errors'

/** User-facing message (pt-BR) for errors coming out of the auth flows. */
export function authErrorMessage(err: unknown): string {
  if (err instanceof NoAccessError || err instanceof SessionExpiredError || err instanceof OrgRequiredError) {
    return err.message
  }
  if (err instanceof NetworkError) return 'Não foi possível conectar ao servidor de autenticação.'
  if (err instanceof ApiError) {
    switch (err.message) {
      case 'invalid credentials':
        return 'Email ou senha inválidos.'
      case 'user disabled':
        return 'Esta conta está desativada.'
      case 'not a member of this organization':
        return 'Sua conta não pertence a esta organização.'
      case 'current password is incorrect':
        return 'A senha atual está incorreta.'
    }
    if (err.status === 400 && err.message.startsWith('password must be')) {
      return 'A nova senha deve ter entre 10 e 128 caracteres.'
    }
  }
  return 'Algo deu errado. Tente novamente.'
}
