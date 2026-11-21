import type { ButtonHTMLAttributes } from 'react'

// `danger` is the outlined secondary-destructive look; `destructive` is the
// filled one for the confirm button of an irreversible action.
type Variant = 'primary' | 'secondary' | 'danger' | 'destructive' | 'ghost'

// Hover/active only apply to enabled buttons; disabled ones share one muted
// look (readable, clearly inert) instead of a half-transparent variant.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white enabled:hover:bg-brand-700 enabled:active:bg-brand-800',
  secondary:
    'border border-brand-300 bg-white text-brand-700 enabled:hover:bg-brand-50 enabled:active:bg-brand-100',
  danger: 'border border-red-300 bg-white text-red-700 enabled:hover:bg-red-50 enabled:active:bg-red-100',
  destructive: 'bg-red-700 text-white enabled:hover:bg-red-800 enabled:active:bg-red-900',
  ghost: 'bg-transparent text-brand-700 enabled:hover:bg-brand-50 enabled:active:bg-brand-100',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

/** Shape/typography/focus shared by <Button> and <ButtonLink>. */
export const BUTTON_BASE_CLASSES =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

export function Button({ variant = 'primary', fullWidth, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${BUTTON_BASE_CLASSES} disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-200 disabled:text-slate-600 ${VARIANT_CLASSES[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}
