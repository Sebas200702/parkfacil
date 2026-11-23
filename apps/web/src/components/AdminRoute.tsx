import { useAuth } from '@context/AuthContext'
import { isAdminUser } from '@lib/token'
import { Notice } from '@shared/ui/notice'
import { type ReactNode, useEffect } from 'react'

export interface AdminRouteProps {
  children: ReactNode
  onNavigate?: (route: string) => void
}

export const AdminRoute = ({ children, onNavigate }: AdminRouteProps) => {
  const { idToken, isAuthenticated, isLoading } = useAuth()
  const isAdmin = isAdminUser(idToken)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      onNavigate?.('/')
    }
  }, [isLoading, isAuthenticated, isAdmin, onNavigate])

  if (isLoading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center p-8 text-asphalt-600"
        role="status"
        aria-live="polite"
      >
        <p className="text-body font-semibold">Cargando panel administrativo...</p>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto max-w-md py-12">
        <Notice tone="error" title="Acceso denegado">
          No tienes permisos para acceder al panel de administración.
        </Notice>
      </div>
    )
  }

  return <>{children}</>
}
