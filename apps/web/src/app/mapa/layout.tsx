import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Parqueaderos' }

/** Solo aporta el título de la pestaña de esta ruta. */
export default function MapLayout({ children }: { children: ReactNode }) {
  return children
}
