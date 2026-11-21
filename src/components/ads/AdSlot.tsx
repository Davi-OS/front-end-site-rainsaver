import { ADS_ENABLED } from '@/config'

interface AdSlotProps {
  /** Stable id of the placement, for the future ad script and reporting (e.g. "home-below-map"). */
  placement: string
  className?: string
}

/**
 * Reserved space for an advertisement. Off by default: renders nothing and
 * takes no space. When enabled it shows an empty, labelled box with a fixed
 * minimum height (so a later ad does not shift the layout). It loads no
 * third-party script and makes no network request; the ad integration, a
 * consent banner (LGPD) and a privacy page must land before it is switched on.
 */
export function AdSlot({ placement, className = '' }: AdSlotProps) {
  if (!ADS_ENABLED) return null

  return (
    <aside aria-label="Publicidade" className={`mt-8 ${className}`}>
      <p className="mb-1 text-xs font-medium tracking-wide text-slate-600 uppercase">Publicidade</p>
      <div
        data-ad-slot={placement}
        className="min-h-[90px] w-full rounded-xl border border-dashed border-slate-300 bg-white sm:min-h-[120px]"
      />
    </aside>
  )
}
