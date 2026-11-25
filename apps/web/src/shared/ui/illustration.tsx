import { cx } from '@shared/utils/cx'

// Ilustraciones de unDraw con el acento recoloreado a brand-600.
// Viven en public/illustrations, la carpeta de estáticos: Next.js las sirve tal cual.
const FILES = {
  welcome: 'welcome.svg',
  'no-reservations': 'no-reservations.svg',
  'no-location': 'no-location.svg',
  'no-results': 'no-results.svg',
  expired: 'expired.svg',
  offline: 'offline.svg',
  road: 'road.svg',
  navigation: 'navigation.svg',
  ride: 'ride.svg',
} as const

export type IllustrationName = keyof typeof FILES

type IllustrationProps = {
  name: IllustrationName
  className?: string
}

/** Decorativa: el texto que la acompaña dice todo, por eso el alt va vacío. */
export const Illustration = ({ name, className }: IllustrationProps) => (
  // biome-ignore lint/performance/noImgElement: con exportación estática no hay optimizador de imágenes y un SVG no lo necesita.
  <img
    src={`/illustrations/${FILES[name]}`}
    alt=""
    width={220}
    height={150}
    className={cx('h-[150px] w-[220px] object-contain', className)}
  />
)
