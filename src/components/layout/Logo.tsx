import { Droplets } from 'lucide-react'

// `translate="no"`: brand name must not be touched by browser auto-translation.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-brand-800 ${className}`} translate="no">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Droplets className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-semibold">RainSaver</span>
    </span>
  )
}
