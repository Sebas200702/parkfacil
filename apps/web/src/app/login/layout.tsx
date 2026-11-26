import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Iniciar sesión' }

/** Solo aporta el título de la pestaña de esta ruta. */
export default function LoginLayout({ children }: { children: ReactNode }) {
  return children
}
