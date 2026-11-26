import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// Ruta privada: no se indexa (robots.txt también la bloquea).
export const metadata: Metadata = { title: 'Mis reservas', robots: { index: false, follow: false } }

/** Solo aporta los metadatos de esta ruta (título, descripción, indexación). */
export default function MyReservationsLayout({ children }: { children: ReactNode }) {
  return children
}
