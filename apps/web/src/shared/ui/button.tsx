import { cx } from '@shared/utils/cx'
import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variant?: ButtonVariant
  icon?: LucideIcon
  /** Botón cuadrado de 48 px solo con icono. Exige aria-label. */
  iconOnly?: boolean
  block?: boolean
  loading?: boolean
  /** Rótulo mientras carga, en gerundio: "Reservando". */
  loadingLabel?: string
  submit?: boolean
}

const BASE =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-plate border-2 font-bold leading-none transition-[color,background-color,translate,box-shadow] duration-150 ease-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus active:translate-y-px motion-reduce:transition-none'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-brand-600 text-paper hover:-translate-y-px hover:bg-brand-700 hover:shadow-marker aria-busy:bg-brand-700',
  secondary:
    'border-asphalt-950 bg-paper text-asphalt-950 hover:-translate-y-px hover:bg-concrete-100 hover:shadow-marker',
  quiet: 'border-transparent text-brand-600 underline decoration-2 underline-offset-4',
  danger: 'border-status-taken bg-paper text-status-taken hover:bg-status-taken-tint',
}

const padding = (variant: ButtonVariant, iconOnly: boolean): string => {
  if (iconOnly) return 'w-12'
  return variant === 'quiet' ? 'px-3' : 'px-5'
}

type ButtonLook = {
  variant?: ButtonVariant
  iconOnly?: boolean
  block?: boolean
}

/** Clases de la placa de acción. Las comparte ButtonLink para que un enlace se vea igual. */
export const buttonClassName = ({
  variant = 'primary',
  iconOnly = false,
  block = false,
}: ButtonLook = {}): string =>
  cx(BASE, VARIANTS[variant], padding(variant, iconOnly), block && 'w-full')

const DOTS = ['', '[animation-delay:0.33s]', '[animation-delay:0.66s]']

const LoadingDots = () => (
  <span aria-hidden="true" className="inline-flex gap-[3px]">
    {DOTS.map((delay) => (
      <i
        key={delay}
        className={cx('size-[5px] animate-dot bg-current motion-reduce:animate-none', delay)}
      />
    ))}
  </span>
)

export const Button = ({
  variant = 'primary',
  icon: Icon,
  iconOnly = false,
  block = false,
  loading = false,
  loadingLabel,
  submit = false,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) => (
  <button
    type={submit ? 'submit' : 'button'}
    aria-busy={loading || undefined}
    onClick={loading ? undefined : onClick}
    className={cx(
      buttonClassName({ variant, iconOnly, block }),
      loading && 'cursor-progress',
      className,
    )}
    {...rest}
  >
    {loading ? (
      <>
        {loadingLabel ?? children}
        <LoadingDots />
      </>
    ) : (
      <>
        {Icon ? <Icon aria-hidden="true" size={20} /> : null}
        {children}
      </>
    )}
  </button>
)
