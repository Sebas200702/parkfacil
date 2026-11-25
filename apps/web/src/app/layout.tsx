import '@shared/styles/theme.css'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AppShell } from './app-shell'

export const metadata: Metadata = {
  title: 'ParkFácil',
  description: 'Consulta cupos de parqueadero en vivo y aparta el tuyo por 15 minutos.',
  icons: { icon: '/favicon.svg' },
}

export const viewport: Viewport = {
  themeColor: '#16131f',
}

/** Componente principal: envuelve todas las rutas con la sesión y la cabecera. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
