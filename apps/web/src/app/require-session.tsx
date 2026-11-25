'use client'

import { useAuth } from '@context/AuthContext'
import { useNavigate } from '@shared/hooks/use-navigate'
import { type ReactNode, useEffect } from 'react'

/** Sin Cognito configurado (desarrollo local con datos de demostración) no hay a quién pedirle sesión. */
const isAuthConfigured = (): boolean => Boolean(process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID)

/**
 * Deja pasar solo a quien tiene sesión. El servicio no queda abierto al público:
 * quien llega sin sesión va a la pantalla de inicio de sesión.
 */
export const RequireSession = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isRestoring } = useAuth()
  const navigate = useNavigate()
  const allowed = isAuthenticated || !isAuthConfigured()

  useEffect(() => {
    if (!isRestoring && !allowed) navigate('/login')
  }, [isRestoring, allowed, navigate])

  if (!allowed) {
    return <output className="block p-4 text-asphalt-600">Comprobando tu sesión…</output>
  }

  return <>{children}</>
}
