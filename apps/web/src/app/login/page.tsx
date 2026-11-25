'use client'

import { LoginScreen } from '@app/login-screen'
import { useNavigate } from '@shared/hooks/use-navigate'
import { useCallback } from 'react'

/** Ruta "/login". Al iniciar sesión, la pantalla pide ir al inicio: para quien entra es el mapa. */
export default function LoginPage() {
  const navigate = useNavigate()
  const handleNavigate = useCallback(
    (route: string) => navigate(route === '/' ? '/mapa' : route),
    [navigate],
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <LoginScreen onNavigate={handleNavigate} />
    </main>
  )
}
