import { cx } from '@shared/utils/cx'
import { CircleAlert } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type FieldProps = {
  label: string
  /** id del control. El error se publica en `${htmlFor}-error`. */
  htmlFor: string
  error?: string
  children: ReactNode
}

export const Field = ({ label, htmlFor, error, children }: FieldProps) => (
  <div className="grid gap-1.5">
    <label htmlFor={htmlFor} className="text-label">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${htmlFor}-error`} className="flex items-center gap-1.5 text-label text-status-taken">
        <CircleAlert aria-hidden="true" size={16} strokeWidth={2.25} />
        {error}
      </p>
    ) : null}
  </div>
)

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  invalid?: boolean
}

export const Input = ({ id, invalid = false, className, ...rest }: InputProps) => (
  <input
    id={id}
    aria-invalid={invalid || undefined}
    aria-describedby={invalid ? `${id}-error` : undefined}
    className={cx(
      'min-h-12 w-full rounded-plate border-2 bg-paper px-3.5 text-body leading-none text-asphalt-950 placeholder:text-asphalt-600 focus-visible:border-asphalt-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus',
      invalid ? 'border-status-taken' : 'border-asphalt-400',
      className,
    )}
    {...rest}
  />
)
