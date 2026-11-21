import type { HTMLAttributes } from 'react'

/** Placeholder block for content that is loading. Purely visual: announce loading separately (role="status"). */
export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none ${className}`}
      {...props}
    />
  )
}
