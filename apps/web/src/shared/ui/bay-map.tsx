import { cx } from '@shared/utils/cx'
import { Ticket } from 'lucide-react'
import type { BayState } from './bay-status'

export type BayVehicle = 'car' | 'moto'

export type BayMapItem = {
  id: string
  state: BayState
  /** Qué vehículo ocupa la bahía; solo se dibuja cuando `state` es `taken`. */
  vehicle?: BayVehicle
}

type BayMapProps = {
  bays: ReadonlyArray<BayMapItem>
  /** Bahías por fila. Las filas se enfrentan a ambos lados de un carril punteado. */
  columns?: number
  /** Nombre accesible del plano: "Plano del parqueadero". */
  label: string
}

const LABELS: Record<BayState, string> = { free: 'Libre', held: 'Reservado', taken: 'Ocupado' }

// Sobre asfalto oscuro se usan las variantes claras de cada estado.
const INK: Record<BayState, string> = {
  free: 'text-status-free-on-dark',
  held: 'text-status-held',
  taken: 'text-status-taken-on-dark',
}

const BAR: Record<BayState, string> = {
  free: 'bg-status-free-on-dark',
  held: 'bg-status-held',
  taken: 'bg-status-taken-on-dark',
}

const Car = () => (
  <svg aria-hidden="true" viewBox="0 0 44 92" className="h-20 fill-current">
    <rect x="1" y="27" width="6" height="7" rx="3" />
    <rect x="37" y="27" width="6" height="7" rx="3" />
    <rect x="6" y="2" width="32" height="88" rx="15" />
    <path d="M11 26q11-5 22 0l3 13H8zM8 55h28l-3 11q-11 4-22 0z" className="fill-asphalt-950/60" />
    <rect
      x="11"
      y="40"
      width="22"
      height="14"
      rx="3"
      className="stroke-asphalt-950/60"
      strokeWidth="1.5"
    />
    <rect x="10" y="6" width="7" height="2.5" rx="1.25" className="fill-status-held" />
    <rect x="27" y="6" width="7" height="2.5" rx="1.25" className="fill-status-held" />
    <rect x="10" y="83.5" width="7" height="2.5" rx="1.25" className="fill-status-held" />
    <rect x="27" y="83.5" width="7" height="2.5" rx="1.25" className="fill-status-held" />
  </svg>
)

const Moto = () => (
  <svg aria-hidden="true" viewBox="0 0 20 64" className="h-16 fill-current">
    <rect x="1" y="12" width="18" height="3" rx="1.5" />
    <rect x="8" y="2" width="4" height="14" rx="2" />
    <rect x="8" y="46" width="4" height="16" rx="2" />
    <rect x="5" y="16" width="10" height="30" rx="5" />
    <rect x="7" y="22" width="6" height="10" rx="3" className="fill-asphalt-950/50" />
  </svg>
)

type BayProps = { bay: BayMapItem; labelFirst: boolean; last: boolean }

const Bay = ({ bay, labelFirst, last }: BayProps) => {
  const { id, state, vehicle = 'car' } = bay
  const tag = (
    <span className="grid justify-items-center gap-2 px-2">
      <span className={cx('h-1 w-full max-w-14 rounded-bay', BAR[state])} />
      <span className={cx('font-mono text-label font-bold', INK[state])}>{id}</span>
    </span>
  )
  return (
    <li
      aria-label={`${id}: ${LABELS[state]}`}
      data-state={state}
      className={cx('grid gap-3', labelFirst ? 'grid-rows-[auto_1fr]' : 'grid-rows-[1fr_auto]')}
    >
      {labelFirst ? tag : null}
      <span
        aria-hidden="true"
        className={cx(
          'flex h-28 items-center justify-center border-concrete-300 border-l-2',
          // Borde exterior que une las bahías: del lado opuesto al rótulo, abierto hacia el carril.
          labelFirst ? 'border-b-2' : 'border-t-2',
          last && 'border-r-2',
          state === 'held' && 'bg-status-held/15 text-status-held',
          state === 'taken' && 'text-status-taken-on-dark',
        )}
      >
        {state === 'held' ? <Ticket size={28} strokeWidth={2} /> : null}
        {state === 'taken' ? vehicle === 'moto' ? <Moto /> : <Car /> : null}
      </span>
      {labelFirst ? null : tag}
    </li>
  )
}

/** Plano del parqueadero visto desde arriba: el estado se lee por vehículo, ticket, rótulo y color. */
export const BayMap = ({ bays, columns = 6, label }: BayMapProps) => {
  const rows = Array.from({ length: Math.ceil(bays.length / columns) }, (_, i) =>
    bays.slice(i * columns, (i + 1) * columns),
  )

  return (
    <section aria-label={label} className="overflow-x-auto rounded-card bg-asphalt-950 p-4">
      <div className="grid min-w-[22rem] gap-5">
        {rows.map((row, index) => (
          <div key={row[0]?.id} className="grid gap-5">
            {index > 0 ? <hr className="border-asphalt-600 border-t-2 border-dashed" /> : null}
            <ul
              className="grid"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {row.map((bay, i) => (
                <Bay
                  key={bay.id}
                  bay={bay}
                  labelFirst={index % 2 === 1}
                  last={i === row.length - 1}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
