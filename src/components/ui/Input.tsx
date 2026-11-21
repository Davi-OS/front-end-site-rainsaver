import { useId, type InputHTMLAttributes } from 'react'
import { FIELD_ERROR_CLASSES, FIELD_LABEL_CLASSES, fieldClasses } from './fieldStyles'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerClassName?: string
}

export function Input({
  label,
  error,
  id,
  className = '',
  containerClassName = '',
  'aria-describedby': describedBy,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? props.name ?? generatedId
  const errorId = `${inputId}-error`
  const described = [describedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className={FIELD_LABEL_CLASSES}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        spellCheck={props.type === 'email' ? false : undefined}
        className={`${fieldClasses(Boolean(error))} ${className}`}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
      />
      {error && (
        <span id={errorId} role="alert" className={FIELD_ERROR_CLASSES}>
          {error}
        </span>
      )}
    </div>
  )
}
