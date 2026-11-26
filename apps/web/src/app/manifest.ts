import { SITE_DESCRIPTION, SITE_NAME } from '@lib/site'
import type { MetadataRoute } from 'next'

// Sale como out/manifest.webmanifest en la exportación estática.
export const dynamic = 'force-static'

/** Manifiesto web: nombre, colores e ícono al agregar ParkFácil a la pantalla de inicio. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: 'es',
    start_url: '/',
    display: 'standalone',
    background_color: '#16131f',
    theme_color: '#16131f',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
