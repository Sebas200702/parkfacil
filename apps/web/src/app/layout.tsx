import '@shared/styles/theme.css'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@lib/site'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { AppShell } from './app-shell'

export const metadata: Metadata = {
  // Base para volver absolutas las URL de canonical y Open Graph.
  metadataBase: new URL(SITE_URL),
  // Cada ruta pone su nombre en su layout: "Mis reservas · ParkFácil".
  title: { default: 'ParkFácil · Parqueaderos con cupo en vivo', template: '%s · ParkFácil' },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'parqueadero',
    'parqueaderos Bogotá',
    'cupos de parqueadero',
    'reservar parqueadero',
    'ParkFácil',
  ],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: SITE_NAME,
    title: 'ParkFácil · Parqueaderos con cupo en vivo',
    description: SITE_DESCRIPTION,
    // PNG fijo en public/: S3 lo sirve como image/png por la extensión.
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'ParkFácil: parqueaderos con cupo en vivo en Bogotá',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ParkFácil',
    description: SITE_DESCRIPTION,
    images: ['/og.png'],
  },
  formatDetection: { telephone: false },
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
