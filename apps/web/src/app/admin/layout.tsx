import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Administración' }

/** Solo aporta el título de la pestaña de esta ruta. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
