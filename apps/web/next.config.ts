import type { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import { createApiRewrites } from './src/lib/dev-proxy'

/** Lo que vale siempre, en desarrollo y al compilar. */
const base: NextConfig = {
  // Sin servidor de Next no hay optimización de imágenes en el momento de la petición.
  images: { unoptimized: true },
  reactStrictMode: true,
}

/** Compilación: `next build` deja el sitio estático en out/ y se sube tal cual a S3. */
const exportConfig: NextConfig = {
  ...base,
  output: 'export',
  // Cada ruta sale como carpeta con su index.html (/login/index.html), que es lo que sirve
  // el hosting de sitio estático de S3.
  trailingSlash: true,
}

/**
 * Desarrollo: igual, más el proxy /api hacia la API del lab (API_PROXY_TARGET en .env.local).
 * Los rewrites solo existen con el servidor de desarrollo; el sitio exportado llama a la API directo.
 */
const devConfig: NextConfig = {
  ...base,
  // Sin esto /api/parqueaderos se redirigiría a /api/parqueaderos/ antes de llegar al proxy.
  skipTrailingSlashRedirect: true,
  rewrites: async () => createApiRewrites(process.env.API_PROXY_TARGET),
}

export default function nextConfig(phase: string): NextConfig {
  return phase === PHASE_DEVELOPMENT_SERVER ? devConfig : exportConfig
}
