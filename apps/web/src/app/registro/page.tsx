'use client'

import { RegisterScreen } from '@app/register-screen'
import { useNavigate } from '@shared/hooks/use-navigate'

/** Ruta "/registro". */
export default function RegisterPage() {
  const navigate = useNavigate()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <RegisterScreen onNavigate={navigate} />
    </main>
  )
}
