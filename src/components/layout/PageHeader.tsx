import type { ReactNode } from 'react'
import { usePageTitle } from '@/lib/usePageTitle'

interface PageHeaderProps {
  title: string
  description?: ReactNode
}

/** The one h1 of a page. The display font comes from the global h1 style. */
export function PageHeader({ title, description }: PageHeaderProps) {
  usePageTitle(title)
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-pretty text-slate-600">{description}</p>}
    </header>
  )
}
