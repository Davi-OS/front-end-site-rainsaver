import { RAINSAVER_API_URL } from '@/config'
import type { Address, AddressInput, PluvialEconomy, SolarEconomy } from '@/types'
import { ApiError, requestJSON } from './http'
import { authorized } from './session'

interface EnderecoDTO {
  id: string
  logradouro: string
  number: string
  bairro: string
  cep: string
  latitude: number
  longitude: number
  cidade: string
  estado: string
  created_at: string
}

interface PluvialEconomyDTO {
  id: string
  endereco_id: string
  area_m2: number
  period_start: string
  period_end: string
  created_at: string
  station_code: string
  distance_km: number
  monthly_captation: { year: number; month: number; rainfall_mm: number; captured_liters: number }[]
}

interface SolarEconomyDTO {
  id: string
  endereco_id: string
  panel_power_w: number
  panel_count: number
  system_kwp: number
  loss_factor: number
  period_start: string
  period_end: string
  created_at: string
  station_code: string
  distance_km: number
  total_kwh: number
  monthly_avg_kwh: number
  monthly_generation: { year: number; month: number; avg_daily_kwh_m2: number; generated_kwh: number }[]
}

const toAddress = (e: EnderecoDTO): Address => ({
  id: e.id,
  cep: e.cep,
  logradouro: e.logradouro,
  bairro: e.bairro,
  number: e.number,
  cidade: e.cidade,
  estado: e.estado,
  latitude: e.latitude,
  longitude: e.longitude,
  createdAt: e.created_at,
})

const toPluvialEconomy = (p: PluvialEconomyDTO): PluvialEconomy => ({
  id: p.id,
  enderecoId: p.endereco_id,
  areaM2: p.area_m2,
  periodStart: p.period_start,
  periodEnd: p.period_end,
  createdAt: p.created_at,
  stationCode: p.station_code,
  distanceKm: p.distance_km,
  months: p.monthly_captation.map((m) => ({
    year: m.year,
    month: m.month,
    rainfallMm: m.rainfall_mm,
    capturedLiters: m.captured_liters,
  })),
})

const toSolarEconomy = (s: SolarEconomyDTO): SolarEconomy => ({
  id: s.id,
  enderecoId: s.endereco_id,
  panelPowerW: s.panel_power_w,
  panelCount: s.panel_count,
  systemKWp: s.system_kwp,
  lossFactor: s.loss_factor,
  periodStart: s.period_start,
  periodEnd: s.period_end,
  createdAt: s.created_at,
  stationCode: s.station_code,
  distanceKm: s.distance_km,
  totalKWh: s.total_kwh,
  monthlyAvgKWh: s.monthly_avg_kwh,
  months: s.monthly_generation.map((m) => ({
    year: m.year,
    month: m.month,
    avgDailyKWhM2: m.avg_daily_kwh_m2,
    generatedKWh: m.generated_kwh,
  })),
})

const url = (path: string) => `${RAINSAVER_API_URL}${path}`

export async function listAddresses(): Promise<Address[]> {
  const list = await authorized((token) => requestJSON<EnderecoDTO[]>(url('/enderecos'), { token }))
  return list.map(toAddress)
}

/** Coordinates are not sent: the backend geocodes the address. */
export async function createAddress(input: AddressInput): Promise<Address> {
  const created = await authorized((token) =>
    requestJSON<EnderecoDTO>(url('/enderecos'), { method: 'POST', token, body: input }),
  )
  return toAddress(created)
}

export async function deleteAddress(id: string): Promise<void> {
  await authorized((token) => requestJSON<void>(url(`/enderecos/${encodeURIComponent(id)}`), { method: 'DELETE', token }))
}

export async function calculatePluvialEconomy(addressId: string, areaM2: number): Promise<PluvialEconomy> {
  const result = await authorized((token) =>
    requestJSON<PluvialEconomyDTO>(url(`/enderecos/${encodeURIComponent(addressId)}/pluvial-economy`), {
      method: 'POST',
      token,
      body: { area_m2: areaM2 },
    }),
  )
  return toPluvialEconomy(result)
}

/** The most recent calculation for the address, or null if none was run yet. */
export async function latestPluvialEconomy(addressId: string): Promise<PluvialEconomy | null> {
  try {
    const result = await authorized((token) =>
      requestJSON<PluvialEconomyDTO>(url(`/enderecos/${encodeURIComponent(addressId)}/pluvial-economy`), { token }),
    )
    return toPluvialEconomy(result)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function calculateSolarEconomy(
  addressId: string,
  panelPowerW: number,
  panelCount: number,
): Promise<SolarEconomy> {
  const result = await authorized((token) =>
    requestJSON<SolarEconomyDTO>(url(`/enderecos/${encodeURIComponent(addressId)}/solar-economy`), {
      method: 'POST',
      token,
      body: { panel_power_w: panelPowerW, panel_count: panelCount },
    }),
  )
  return toSolarEconomy(result)
}

/** The most recent estimate for the address, or null if none was run yet. */
export async function latestSolarEconomy(addressId: string): Promise<SolarEconomy | null> {
  try {
    const result = await authorized((token) =>
      requestJSON<SolarEconomyDTO>(url(`/enderecos/${encodeURIComponent(addressId)}/solar-economy`), { token }),
    )
    return toSolarEconomy(result)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}
