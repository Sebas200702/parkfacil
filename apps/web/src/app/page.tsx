import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@lib/site'
import type { Metadata } from 'next'
import { LandingScreen } from './landing-screen'

// Solo la portada declara "/" como canónica; las demás rutas públicas ponen la suya.
export const metadata: Metadata = { alternates: { canonical: '/' } }

/** Datos estructurados (schema.org) para que los buscadores entiendan qué es ParkFácil. */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  areaServed: { '@type': 'City', name: 'Bogotá' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'COP' },
}

/** Ruta "/": la landing pública. Es la primera vista del dominio. */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON fijo del propio sitio; "<" se escapa para que no pueda cerrar la etiqueta.
        // biome-ignore lint/security/noDangerouslySetInnerHtml: es la forma documentada de JSON-LD en Next.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <LandingScreen />
    </>
  )
}
