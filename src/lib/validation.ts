export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidCep(cep: string): boolean {
  return cep.replace(/\D/g, '').length === 8
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0
}

/** go-auth-service's password policy (the server enforces it too). */
export const MIN_PASSWORD_LENGTH = 10
export const MAX_PASSWORD_LENGTH = 128

/** Why a new password (and its confirmation) is not acceptable, or null if it is. */
export function newPasswordError(password: string, confirmation: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  if (password.length > MAX_PASSWORD_LENGTH) return `A nova senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`
  if (password !== confirmation) return 'A confirmação não confere com a nova senha.'
  return null
}
