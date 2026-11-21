import { useId, type SelectHTMLAttributes } from 'react'
import { FIELD_ERROR_CLASSES, FIELD_LABEL_CLASSES, fieldClasses } from './fieldStyles'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({
  label,
  error,
  id,
  className = '',
  children,
  'aria-describedby': describedBy,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? props.name ?? generatedId
  const errorId = `${selectId}-error`
  const described = [describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className={FIELD_LABEL_CLASSES}>
          {label}
        </label>
      )}
      {/* Explicit background/color: native selects ignore the page theme on some OSes. */}
      <select
        id={selectId}
        className={`${fieldClasses(Boolean(error))} ${className}`}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
      >
        {children}
      </select>
      {error && (
        <span id={errorId} role="alert" className={FIELD_ERROR_CLASSES}>
          {error}
        </span>
      )}
    </div>
  )
}
