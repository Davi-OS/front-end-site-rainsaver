export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidCep(cep: string): boolean {
  return cep.replace(/\D/g, '').length === 8
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0
}
