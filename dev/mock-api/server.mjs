// DEVELOPMENT ONLY. A fake of go-auth-service and the rain-saver API, so the
// front-end can be developed and demoed without the real backends. It is not
// part of the build or the deploy, and it listens on 127.0.0.1 only.
//
//   npm run mock:api
//
// Ports match the app's defaults (auth 8080, rain-saver 8081); override with
// MOCK_AUTH_PORT / MOCK_RAINSAVER_PORT. MOCK_PLANS_MODE=error|empty makes
// GET /planos fail (500) or return no plans. MOCK_LATENCY_MS (default 250)
// slows every response, to look at loading states. Edit plans.json while it
// runs: it is re-read on every request.
//
// Test accounts: any e-mail and password log in. An e-mail starting with
// "erro" is refused (401); one starting with "assinante" gets a token that
// carries the `plan:subscriber` permission.

import http from 'node:http'
import { readFile } from 'node:fs/promises'

const AUTH_PORT = Number(process.env.MOCK_AUTH_PORT ?? 8080)
const RAINSAVER_PORT = Number(process.env.MOCK_RAINSAVER_PORT ?? 8081)
const PLANS_MODE = process.env.MOCK_PLANS_MODE ?? 'ok'
const LATENCY_MS = Number(process.env.MOCK_LATENCY_MS ?? 250) // so loading states are visible
const PLANS_FILE = new URL('./plans.json', import.meta.url)

// ---- tokens: unsigned (alg none). The front only decodes them; the real
// backends are the ones that verify.
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
const permsFor = (email) => (email.startsWith('assinante') ? ['plan:subscriber'] : [])
const accessToken = (email) =>
  `${b64({ alg: 'none' })}.${b64({ sub: email, org: 'o1', perms: permsFor(email), exp: Math.floor(Date.now() / 1000) + 3600 })}.x`
const tokenPair = (email) => ({ access_token: accessToken(email), refresh_token: `r.${Buffer.from(email).toString('base64url')}.${Math.random()}` })
const emailFromAccessToken = (req) => {
  try {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '')
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub
  } catch {
    return 'maria.silva@exemplo.com.br'
  }
}

function serve(port, handler) {
  http
    .createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
      if (req.method === 'OPTIONS') return res.writeHead(204).end()

      let raw = ''
      for await (const chunk of req) raw += chunk
      const body = raw ? JSON.parse(raw) : undefined
      console.log(`${req.method} :${port}${req.url} ${req.headers.authorization ? '(com token)' : '(sem token)'}`)

      await new Promise((resolve) => setTimeout(resolve, LATENCY_MS))
      const out = await handler(req, body)
      if (out === undefined) return res.writeHead(204).end()
      res.writeHead(out.status ?? 200, { 'Content-Type': 'application/json' }).end(JSON.stringify(out.json))
    })
    .listen(port, '127.0.0.1')
}

const notFound = { status: 404, json: { error: 'not_found' } }

// ---- go-auth-service
serve(AUTH_PORT, (req, body) => {
  if (req.url === '/login' || req.url === '/signup') {
    if (body?.email?.startsWith('erro')) return { status: 401, json: { error: 'invalid credentials' } }
    return { json: tokenPair(body?.email ?? 'maria.silva@exemplo.com.br') }
  }
  if (req.url === '/refresh') {
    const email = Buffer.from(String(body?.refresh_token).split('.')[1] ?? '', 'base64url').toString()
    return { json: tokenPair(email || 'maria.silva@exemplo.com.br') }
  }
  if (req.url === '/logout') return undefined
  if (req.url === '/me') {
    const email = emailFromAccessToken(req)
    return { json: { id: email, email } }
  }
  return notFound
})

// ---- rain-saver
let seed = 7
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const UFS = ['SP', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'AM', 'GO', 'PA']
const stations = Array.from({ length: 80 }, (_, i) => ({
  code: `A${100 + i}`,
  name: `ESTAÇÃO ${i + 1}`,
  latitude: -30 + random() * 33,
  longitude: -70 + random() * 35,
  uf: UFS[i % UFS.length],
}))

const addresses = [
  { id: 'e1', logradouro: 'Rua das Acácias', number: '120', bairro: 'Jardim Botânico', cep: '80210-000', latitude: -25.4, longitude: -49.2, cidade: 'Curitiba', estado: 'PR', created_at: '2026-10-01T00:00:00Z' },
  { id: 'e2', logradouro: 'Avenida Governador Agamenon Magalhães de Albuquerque Filho', number: '4500', bairro: 'Boa Viagem', cep: '51021-040', latitude: -8.1, longitude: -34.9, cidade: 'Recife', estado: 'PE', created_at: '2026-10-02T00:00:00Z' },
]

// Last 12 months, oldest first.
const RAIN_MM = [212, 180, 140, 95, 60, 40, 35, 48, 90, 150, 190, 220]
const months = RAIN_MM.map((rain, i) => {
  const date = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 11 + i, 1))
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, rain }
})
const latestCalculation = new Map() // `${addressId}:${kind}` -> response

function calculate(addressId, kind, body) {
  if (kind === 'pluvial') {
    return {
      id: 'p1', endereco_id: addressId, area_m2: body.area_m2, period_start: '2025-11-01', period_end: '2026-10-31', created_at: new Date().toISOString(),
      station_code: 'A807', distance_km: 12.4,
      monthly_captation: months.map((m) => ({ year: m.year, month: m.month, rainfall_mm: m.rain, captured_liters: m.rain * body.area_m2 })),
    }
  }
  const kwp = (body.panel_power_w * body.panel_count) / 1000
  const generation = months.map((m, i) => ({ year: m.year, month: m.month, avg_daily_kwh_m2: 4.5, generated_kwh: kwp * 4.5 * 30 * 0.85 * (0.8 + 0.04 * (i % 6)) }))
  const total = generation.reduce((sum, g) => sum + g.generated_kwh, 0)
  const tariff = body.tariff_brl_per_kwh
  return {
    id: 's1', endereco_id: addressId, panel_power_w: body.panel_power_w, panel_count: body.panel_count, system_kwp: kwp, loss_factor: 0.15,
    period_start: '2025-11-01', period_end: '2026-10-31', created_at: new Date().toISOString(), station_code: 'A801', distance_km: 31.8,
    ...(tariff ? { tariff_brl_per_kwh: tariff, total_savings_brl: total * tariff, monthly_avg_savings_brl: (total * tariff) / 12 } : {}),
    total_kwh: total, monthly_avg_kwh: total / 12,
    monthly_generation: generation.map((g) => ({ ...g, ...(tariff ? { savings_brl: g.generated_kwh * tariff } : {}) })),
  }
}

serve(RAINSAVER_PORT, async (req, body) => {
  const { url, method } = req
  if (url === '/estacoes') return { json: stations }

  // Public (no token): the plans and prices on offer. Contract in docs/ARCHITECTURE.md.
  if (url === '/planos') {
    if (PLANS_MODE === 'error') return { status: 500, json: { error: 'mock: planos indisponíveis' } }
    if (PLANS_MODE === 'empty') return { json: [] }
    try {
      return { json: JSON.parse(await readFile(PLANS_FILE, 'utf8')) }
    } catch {
      return { status: 500, json: { error: 'mock: plans.json inválido' } }
    }
  }

  if (url === '/enderecos' && method === 'GET') return { json: addresses }
  if (url === '/enderecos' && method === 'POST') {
    const created = { id: `e${addresses.length + 1}`, latitude: -23, longitude: -46, created_at: new Date().toISOString(), ...body }
    addresses.unshift(created)
    return { status: 201, json: created }
  }
  const remove = url.match(/^\/enderecos\/([^/]+)$/)
  if (remove && method === 'DELETE') {
    const index = addresses.findIndex((a) => a.id === remove[1])
    if (index >= 0) addresses.splice(index, 1)
    return undefined
  }
  const economy = url.match(/^\/enderecos\/([^/]+)\/(pluvial|solar)-economy$/)
  if (economy) {
    const [, addressId, kind] = economy
    const key = `${addressId}:${kind}`
    if (method === 'GET') return latestCalculation.has(key) ? { json: latestCalculation.get(key) } : notFound
    const result = calculate(addressId, kind, body)
    latestCalculation.set(key, result)
    return { json: result }
  }
  return notFound
})

console.log(`mock-api: auth http://127.0.0.1:${AUTH_PORT}, rain-saver http://127.0.0.1:${RAINSAVER_PORT} (planos: ${PLANS_MODE})`)
