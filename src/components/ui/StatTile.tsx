import type { LucideIcon } from 'lucide-react'

type Tone = 'brand' | 'sun'

const TONE_CLASSES: Record<Tone, string> = {
  brand: 'bg-brand-100 text-brand-800',
  sun: 'bg-sun-100 text-sun-800',
}

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  tone?: Tone
}

export function StatTile({ icon: Icon, label, value, hint, tone = 'brand' }: StatTileProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-600">{label}</p>
        <p className="font-display text-3xl font-semibold text-slate-900 tabular-nums">{value}</p>
        {hint && <p className="text-xs text-slate-600">{hint}</p>}
      </div>
    </div>
  )
}
