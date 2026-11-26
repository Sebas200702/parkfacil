'use client'

import { AuthProvider, useAuth } from '@context/AuthContext'
import { useNavigate } from '@shared/hooks/use-navigate'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppHeader } from './app-header'

/** Destino del enlace "Saltar al contenido". */
const CONTENT_ID = 'contenido'

/** Primer elemento de la página: con teclado deja pasar de largo la cabecera. Solo se ve con foco. */
const SkipLink = () => (
  <a
    href={`#${CONTENT_ID}`}
    className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-plate focus-visible:bg-paint focus-visible:px-4 focus-visible:py-3 focus-visible:font-bold focus-visible:text-asphalt-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-asphalt-950"
  >
    Saltar al contenido
  </a>
)

const Shell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const pathname = usePathname()
  const { isLoading } = useAuth()
  // La landing trae su propia barra, con el estilo de póster; el resto usa la cabecera de la app.
  const isLanding = pathname === '/'

  return (
    <div className="min-h-dvh">
      <SkipLink />
      {isLanding ? null : <AppHeader onNavigate={navigate} />}
      <div id={CONTENT_ID} tabIndex={-1} className="outline-none">
        {children}
      </div>
      {isLoading ? <output className="sr-only">Cargando...</output> : null}
    </div>
  )
}

/** Sesión y cabecera compartidas por todas las rutas. Vive en el cliente porque usa Cognito. */
export const AppShell = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <Shell>{children}</Shell>
  </AuthProvider>
)
