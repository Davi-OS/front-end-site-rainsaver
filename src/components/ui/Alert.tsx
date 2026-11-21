import { useEffect, useRef, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type Variant = 'info' | 'warning' | 'success' | 'error'

const VARIANT_CLASSES: Record<Variant, string> = {
  info: 'bg-brand-50 text-brand-900 border-brand-200',
  warning: 'bg-sun-50 text-sun-900 border-sun-200',
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  error: 'bg-red-50 text-red-900 border-red-200',
}

const VARIANT_ICONS: Record<Variant, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
}

// Problems interrupt (role="alert"); informational messages are announced
// politely (role="status").
const VARIANT_ROLES: Record<Variant, 'alert' | 'status'> = {
  info: 'status',
  warning: 'alert',
  success: 'status',
  error: 'alert',
}

interface AlertProps {
  variant?: Variant
  children: ReactNode
  className?: string
  /** Moves keyboard focus to the alert when it appears (use for form errors after a submit). */
  focusOnMount?: boolean
}

export function Alert({ variant = 'info', children, className = '', focusOnMount = false }: AlertProps) {
  const Icon = VARIANT_ICONS[variant]
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusOnMount) ref.current?.focus()
  }, [focusOnMount])

  return (
    <div
      ref={ref}
      role={VARIANT_ROLES[variant]}
      tabIndex={focusOnMount ? -1 : undefined}
      className={`flex items-start gap-3 rounded-lg border p-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  )
}
