import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Parqueaderos',
  description: 'Mapa de parqueaderos en Bogotá con cupos libres en vivo para carro y moto.',
  alternates: { canonical: '/mapa/' },
}

/** Solo aporta los metadatos de esta ruta (título, descripción, indexación). */
export default function MapLayout({ children }: { children: ReactNode }) {
  return children
}
