const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

export function formatBRL(value: number): string {
  return brlFormatter.format(value)
}

export function formatLiters(value: number): string {
  return `${numberFormatter.format(value)} L`
}

export function formatMm(value: number): string {
  return `${numberFormatter.format(value)} mm`
}
