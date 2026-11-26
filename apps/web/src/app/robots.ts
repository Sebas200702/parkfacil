import { absoluteUrl, PRIVATE_ROUTES, SITE_URL } from '@lib/site'
import type { MetadataRoute } from 'next'

// La exportación estática solo genera rutas marcadas como estáticas: sale como out/robots.txt.
export const dynamic = 'force-static'

/** robots.txt: todo el sitio público se rastrea; las rutas privadas no. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...PRIVATE_ROUTES] },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
