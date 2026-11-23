import expired from '@shared/assets/illustrations/expired.svg'
import noLocation from '@shared/assets/illustrations/no-location.svg'
import noReservations from '@shared/assets/illustrations/no-reservations.svg'
import noResults from '@shared/assets/illustrations/no-results.svg'
import offline from '@shared/assets/illustrations/offline.svg'
import welcome from '@shared/assets/illustrations/welcome.svg'
import { cx } from '@shared/utils/cx'

// Ilustraciones de unDraw con el acento recoloreado a brand-600.
const SOURCES = {
  welcome,
  'no-reservations': noReservations,
  'no-location': noLocation,
  'no-results': noResults,
  expired,
  offline,
} as const

export type IllustrationName = keyof typeof SOURCES

type IllustrationProps = {
  name: IllustrationName
  className?: string
}

/** Decorativa: el texto que la acompaña dice todo, por eso el alt va vacío. */
export const Illustration = ({ name, className }: IllustrationProps) => (
  <img
    src={SOURCES[name]}
    alt=""
    width={220}
    height={150}
    className={cx('h-[150px] w-[220px] object-contain', className)}
  />
)
