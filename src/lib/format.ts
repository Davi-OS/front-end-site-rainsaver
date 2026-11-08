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

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' })

/** e.g. (2026, 1) -> "jan. de 2026" */
export function formatMonth(year: number, month: number): string {
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1)))
}

const kmFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

export function formatKm(value: number): string {
  return `${kmFormatter.format(value)} km`
}

export function formatKWh(value: number): string {
  return `${numberFormatter.format(value)} kWh`
}

const decimalFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })

export function formatKWp(value: number): string {
  return `${decimalFormatter.format(value)} kWp`
}

/** Average daily irradiation, e.g. "5,2 kWh/m²/dia". */
export function formatIrradiation(value: number): string {
  return `${decimalFormatter.format(value)} kWh/m²/dia`
}
