import { useMemo, useState } from 'react'
import type { Station } from '@/types'
import { Input } from '@/components/ui'

const MAX_SHOWN = 50

// Accent- and case-insensitive: "sao paulo" finds "SÃO PAULO".
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/**
 * Text alternative to the map: the stations are not reachable by keyboard on
 * the map itself, so this searchable list gives the same information.
 */
export function StationsList({ stations }: { stations: Station[] }) {
  const [query, setQuery] = useState('')

  const matches = useMemo(() => {
    const needle = normalize(query.trim())
    if (!needle) return stations
    return stations.filter((s) => normalize(`${s.name} ${s.uf} ${s.code}`).includes(needle))
  }, [stations, query])

  return (
    <details className="group mt-3 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex min-h-11 cursor-pointer items-center rounded-2xl px-5 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 group-open:rounded-b-none">
        Ver a lista de estações
      </summary>
      <div className="flex flex-col gap-3 border-t border-slate-200 p-5">
        <Input
          label="Buscar estação"
          name="stationSearch"
          type="search"
          autoComplete="off"
          placeholder="Nome, estado ou código…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-sm text-slate-600" aria-live="polite">
          {matches.length === 0
            ? 'Nenhuma estação encontrada. Tente outro nome, estado ou código.'
            : matches.length > MAX_SHOWN
              ? `${matches.length} estações. Mostrando as primeiras ${MAX_SHOWN}: refine a busca para ver as outras.`
              : `${matches.length} ${matches.length === 1 ? 'estação encontrada' : 'estações encontradas'}.`}
        </p>
        <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {matches.slice(0, MAX_SHOWN).map((s) => (
            <li key={s.code} className="min-w-0 break-words text-slate-700">
              <span className="font-medium text-slate-900">{s.name}</span>
              {s.uf && ` · ${s.uf}`} · <span className="tabular-nums">{s.code}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
