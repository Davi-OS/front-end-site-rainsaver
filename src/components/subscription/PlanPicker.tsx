import { Check } from 'lucide-react'
import type { Plan, PlanId } from '@/subscription/types'
import { formatBRL } from '@/lib/format'

interface PlanPickerProps {
  plans: Plan[]
  /** Selected plan. Omit `onChange` for a read-only list (visitors). */
  value?: PlanId
  onChange?: (id: PlanId) => void
  disabled?: boolean
}

function PlanBody({ plan }: { plan: Plan }) {
  return (
    <>
      {/* Name and highlight come from the backend: let long text wrap instead of overflowing the card. */}
      <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="min-w-0 font-display text-lg font-semibold break-words text-slate-900">{plan.name}</span>
        {plan.highlight && (
          <span className="min-w-0 rounded-full bg-sun-100 px-2 py-0.5 text-xs font-semibold break-words text-sun-800">
            {plan.highlight}
          </span>
        )}
      </span>
      <span className="mt-1 block text-2xl font-semibold text-slate-900 tabular-nums">
        {formatBRL(plan.priceBRL)}
        <span className="text-sm font-medium text-slate-600">&nbsp;por&nbsp;{plan.period}</span>
      </span>
    </>
  )
}

/**
 * Plan choice as native radio buttons (one tab stop, arrow keys, screen-reader
 * grouping for free), drawn as cards. Without `onChange` it is just a list.
 */
export function PlanPicker({ plans, value, onChange, disabled }: PlanPickerProps) {
  if (!onChange) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {plans.map((plan) => (
          <li key={plan.id} className="rounded-xl border border-slate-300 bg-white p-4">
            <PlanBody plan={plan} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-slate-700">Escolha o plano</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((plan) => (
          <label key={plan.id} className="block cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60">
            <input
              type="radio"
              name="plan"
              value={plan.id}
              checked={value === plan.id}
              onChange={() => onChange(plan.id)}
              className="peer sr-only"
            />
            <span className="relative block rounded-xl border-2 border-slate-300 bg-white p-4 pr-11 transition-colors peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 hover:border-brand-400">
              <PlanBody plan={plan} />
              {/* The check mark makes the selection visible without relying on color alone. */}
              <span
                aria-hidden="true"
                className={`absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  value === plan.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-400 bg-white'
                }`}
              >
                {value === plan.id && <Check className="h-3 w-3" />}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
