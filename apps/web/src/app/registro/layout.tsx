import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta gratis en ParkFácil y aparta cupos de parqueadero por 15 minutos.',
  alternates: { canonical: '/registro/' },
}

/** Solo aporta los metadatos de esta ruta (título, descripción, indexación). */
export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children
}
