'use client'

import { AuthProvider, useAuth } from '@context/AuthContext'
import { useNavigate } from '@shared/hooks/use-navigate'
import type { ReactNode } from 'react'
import { AppHeader } from './app-header'

const Shell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const { isLoading } = useAuth()

  return (
    <div className="min-h-dvh">
      <AppHeader onNavigate={navigate} />
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
