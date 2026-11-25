import type { ReactNode } from 'react'

type StarburstProps = {
  /** Nombre accesible del sello. Sin él se trata como adorno. */
  label?: string
  /** Clase de relleno de la estrella: "fill-paint". */
  fill: string
  className?: string
  /** Texto del sello, como elementos <text> de SVG en un lienzo de 200 × 200. */
  children: ReactNode
}

/** Sello estrellado de doce puntas que gira despacio. El texto se queda quieto. */
export const Starburst = ({ label, fill, className, children }: StarburstProps) => (
  <svg
    viewBox="0 0 200 200"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    className={className}
  >
    <g className={`lp-spin ${fill}`}>
      <rect x="30" y="30" width="140" height="140" />
      <rect x="30" y="30" width="140" height="140" transform="rotate(30 100 100)" />
      <rect x="30" y="30" width="140" height="140" transform="rotate(60 100 100)" />
    </g>
    {children}
  </svg>
)
