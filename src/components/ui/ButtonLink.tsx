import { Link, type LinkProps } from 'react-router-dom'
import { BUTTON_BASE_CLASSES } from './Button'

type Variant = 'primary' | 'secondary' | 'ghost'

// Plain `hover:` (not `enabled:hover:` like <Button>): links are never :enabled.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary: 'border border-brand-300 bg-white text-brand-700 hover:bg-brand-50 active:bg-brand-100',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50 active:bg-brand-100',
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  fullWidth?: boolean
}

/** A react-router <Link> that looks like a <Button> (navigation must be a link, not a button). */
export function ButtonLink({ variant = 'primary', fullWidth, className = '', ...props }: ButtonLinkProps) {
  return (
    <Link
      className={`${BUTTON_BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}
