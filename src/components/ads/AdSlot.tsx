import { Link } from 'react-router-dom'
import { ADS_ENABLED } from '@/config'
import { useSubscription } from '@/subscription/useSubscription'

interface AdSlotProps {
  /** Stable id of the placement, for the future ad script and reporting (e.g. "home-below-map"). */
  placement: string
  /** Spacing from the surrounding content, e.g. "mt-8". */
  className?: string
}

/**
 * Reserved space for an advertisement. Off by default: renders nothing and
 * takes no space. It also renders nothing for subscribers, and while we are
 * still finding out whether the user is one (so a subscriber never sees an ad
 * flash). When shown it is an empty, labelled box with a fixed minimum height
 * (so a later ad does not shift the layout). It loads no third-party script
 * and makes no network request; the ad integration, a consent banner (LGPD)
 * and a privacy page must land before it is switched on.
 */
export function AdSlot({ placement, className = '' }: AdSlotProps) {
  const { mode, ready, isSubscriber } = useSubscription()
  if (!ADS_ENABLED || !ready || isSubscriber) return null

  return (
    <aside aria-label="Publicidade" className={className}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-slate-600 uppercase">Publicidade</p>
        {mode !== 'off' && (
          <Link
            to="/assinatura"
            className="rounded text-xs font-semibold text-brand-700 underline hover:text-brand-800"
          >
            Remover anúncios
          </Link>
        )}
      </div>
      <div
        data-ad-slot={placement}
        className="min-h-[90px] w-full rounded-xl border border-dashed border-slate-300 bg-white sm:min-h-[120px]"
      />
    </aside>
  )
}
