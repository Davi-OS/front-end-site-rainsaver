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

/**
 * Why a new password (and its confirmation) is not acceptable, or null if
 * it is. label names it in the message ("nova senha", or "senha" at signup).
 */
export function newPasswordError(password: string, confirmation: string, label = 'nova senha'): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `A ${label} deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  if (password.length > MAX_PASSWORD_LENGTH) return `A ${label} deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`
  if (password !== confirmation) return `A confirmação não confere com a ${label}.`
  return null
}
