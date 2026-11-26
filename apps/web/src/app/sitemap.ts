import { absoluteUrl, PUBLIC_ROUTES } from '@lib/site'
import type { MetadataRoute } from 'next'

// Sale como out/sitemap.xml en la exportación estática.
export const dynamic = 'force-static'

/** sitemap.xml con las páginas públicas. La fecha es la de la compilación (cada despliegue). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }))
}
