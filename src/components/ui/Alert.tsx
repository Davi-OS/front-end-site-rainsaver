import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type Variant = 'info' | 'warning' | 'success' | 'error'

const VARIANT_CLASSES: Record<Variant, string> = {
  info: 'bg-brand-50 text-brand-800 border-brand-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  error: 'bg-red-50 text-red-800 border-red-200',
}

const VARIANT_ICONS: Record<Variant, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
}

interface AlertProps {
  variant?: Variant
  children: ReactNode
  className?: string
}

export function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  const Icon = VARIANT_ICONS[variant]
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${VARIANT_CLASSES[variant]} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
