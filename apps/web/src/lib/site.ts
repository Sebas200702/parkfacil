/**
 * Datos públicos del sitio para SEO: URL canónica, nombre y qué rutas se indexan.
 * NEXT_PUBLIC_SITE_URL cambia el dominio (por ejemplo en una copia de prueba); sin ella es parkfacil.app.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://parkfacil.app').replace(
  /\/+$/,
  '',
)

export const SITE_NAME = 'ParkFácil'

export const SITE_DESCRIPTION =
  'Consulta cupos de parqueadero en vivo en Bogotá y aparta el tuyo por 15 minutos desde el celular.'

/** Rutas que buscan los motores: van al sitemap, en el orden de importancia. */
export const PUBLIC_ROUTES = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/mapa/', priority: 0.9, changeFrequency: 'daily' },
  { path: '/registro/', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/login/', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacidad.html', priority: 0.3, changeFrequency: 'yearly' },
] as const

/** Rutas con sesión o de uso interno: robots.txt las bloquea y sus páginas llevan noindex. */
export const PRIVATE_ROUTES = ['/admin/', '/reservas/', '/ui/'] as const

export const absoluteUrl = (path: string): string => `${SITE_URL}${path}`
