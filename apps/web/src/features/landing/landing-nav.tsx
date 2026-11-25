'use client'

import { cx } from '@shared/utils/cx'
import { LogIn, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// En móvil y tablet cada píldora ocupa la mitad del ancho; en escritorio toma su tamaño natural.
const PILL =
  'lp-mono lp-nav-pill inline-flex min-h-[2.875rem] flex-1 items-center justify-center gap-2 rounded-full border-2 border-asphalt-950 px-4 font-bold lg:flex-none'

const SECTIONS = [
  { href: '#plano', label: 'El plano' },
  { href: '#pasos', label: 'Cómo funciona' },
  { href: '#tiquete', label: 'El tiquete' },
]

/** Marca: una bahía con el cupo apartado en violeta. Mismo dibujo que public/favicon.svg. */
const BrandMark = () => (
  <svg aria-hidden="true" viewBox="0 0 32 32" className="lp-brand-mark size-[2.375rem] shrink-0">
    <rect width="32" height="32" rx="6" className="fill-asphalt-950" />
    <rect x="11.5" y="10.5" width="9" height="16" className="fill-brand-600" />
    <path
      d="M8.5 27V7.5h15V27"
      fill="none"
      strokeWidth="3"
      strokeLinejoin="round"
      className="stroke-paper"
    />
  </svg>
)

/**
 * Barra de la landing: marca, saltos a las secciones y las dos entradas a la app.
 * En escritorio va en una fila. En móvil y tablet el menú de secciones se despliega
 * con un botón y las dos entradas ocupan todo el ancho.
 */
export const LandingNav = () => {
  const [open, setOpen] = useState(false)
  const MenuIcon = open ? X : Menu

  return (
    <header className="mx-auto grid w-full max-w-[85rem] grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 px-6 py-5 lg:flex lg:justify-between">
      <Link
        href="/"
        className="lp-brand inline-flex items-center gap-3 justify-self-start font-display text-[1.15rem] font-black tracking-tight"
      >
        <BrandMark />
        PARKFÁCIL
      </Link>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="landing-menu"
        onClick={() => setOpen((current) => !current)}
        className="lp-mono lp-nav-pill inline-flex min-h-[2.875rem] cursor-pointer items-center gap-2 rounded-full border-2 border-asphalt-950 px-4 font-bold lg:hidden"
      >
        <MenuIcon aria-hidden="true" size={20} />
        {open ? 'Cerrar' : 'Menú'}
      </button>

      {/* El truco de filas 0fr → 1fr anima la altura sin conocerla de antemano. */}
      <div
        id="landing-menu"
        className={cx(
          'lp-menu col-span-2 grid transition-[grid-template-rows] duration-300 ease-out lg:block',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <nav
          aria-label="Secciones"
          className={cx(
            'lp-mono min-h-0 overflow-hidden lg:flex lg:gap-7 lg:overflow-visible',
            open ? 'visible' : 'invisible lg:visible',
          )}
        >
          <ul className="grid border-asphalt-950 border-y-2 lg:flex lg:gap-7 lg:border-y-0">
            {SECTIONS.map(({ href, label }) => (
              <li key={href} className="border-concrete-300 border-b last:border-b-0 lg:border-b-0">
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="lp-nav-link block py-3 lg:inline lg:py-1.5"
                >
                  / {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <nav aria-label="Cuenta" className="col-span-2 flex items-center gap-2.5">
        <Link href="/login" className={PILL}>
          <LogIn aria-hidden="true" size={20} />
          Entrar
        </Link>
        <Link href="/registro" className={`${PILL} bg-asphalt-950 text-cream`}>
          Crear cuenta
        </Link>
      </nav>
    </header>
  )
}
