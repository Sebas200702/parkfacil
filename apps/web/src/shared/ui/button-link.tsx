import { cx } from '@shared/utils/cx'
import type { LucideIcon } from 'lucide-react'
import type { AnchorHTMLAttributes } from 'react'
import { type ButtonVariant, buttonClassName } from './button'

type ButtonLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & {
  href: string
  variant?: ButtonVariant
  icon?: LucideIcon
  block?: boolean
  /** Abre en otra pestaña. Para destinos fuera de ParkFácil, como un mapa de rutas. */
  external?: boolean
}

/** Enlace con el aspecto de un botón, para acciones que llevan a otra página. */
export const ButtonLink = ({
  variant = 'secondary',
  icon: Icon,
  block = false,
  external = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) => (
  <a
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className={cx(buttonClassName({ variant, block }), className)}
    {...rest}
  >
    {Icon ? <Icon aria-hidden="true" size={20} /> : null}
    {children}
  </a>
)
