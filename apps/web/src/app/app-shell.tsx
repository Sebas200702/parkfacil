'use client'

import { AuthProvider, useAuth } from '@context/AuthContext'
import { useNavigate } from '@shared/hooks/use-navigate'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppHeader } from './app-header'

const Shell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const pathname = usePathname()
  const { isLoading } = useAuth()
  // La landing trae su propia barra, con el estilo de póster; el resto usa la cabecera de la app.
  const isLanding = pathname === '/'

  return (
    <div className="min-h-dvh">
      {isLanding ? null : <AppHeader onNavigate={navigate} />}
      {children}
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
