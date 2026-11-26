import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Mis reservas' }

/** Solo aporta el título de la pestaña de esta ruta. */
export default function MyReservationsLayout({ children }: { children: ReactNode }) {
  return children
}
