import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Entra a ParkFácil para apartar un cupo y ver tus reservas.',
  alternates: { canonical: '/login/' },
}

/** Solo aporta los metadatos de esta ruta (título, descripción, indexación). */
export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
