import { cx } from '@shared/utils/cx'
import { freeBays, METER_BAYS } from './utils/cupo-meter-util'

type CupoMeterProps = {
  free: number
  capacity: number
}

const BAYS = Array.from({ length: METER_BAYS }, (_, index) => ({ id: `bay-${index}`, index }))

/** La cifra exacta en texto: "5 libres de 12". Es la fuente de verdad junto a cualquier dibujo. */
export const CupoCount = ({ free, capacity }: CupoMeterProps) => {
  const full = free <= 0

  return (
    <span className="block text-caption leading-6 text-asphalt-600">
      <b
        className={cx(
          'mr-1.5 font-mono text-figure tabular-nums',
          full ? 'text-asphalt-600' : 'text-asphalt-950',
        )}
      >
        {Math.max(0, free)}
      </b>
      libres de {capacity}
      {full ? ' · lleno' : ''}
    </span>
  )
}

// Usa solo <span> para poder vivir dentro de un botón (la fila de un parqueadero).
export const CupoMeter = ({ free, capacity }: CupoMeterProps) => {
  const firstFree = METER_BAYS - freeBays(free, capacity)

  return (
    <span className="grid gap-2">
      <span aria-hidden="true" className="grid grid-cols-12 gap-1">
        {BAYS.map(({ id, index }) => (
          <span
            key={id}
            className={cx(
              'h-4 rounded-t-bay border-2 border-b-0',
              // Lo ocupado va en gris: el rojo se reserva para errores y el panel admin.
              index >= firstFree ? 'border-status-free' : 'border-asphalt-400 bg-asphalt-400',
            )}
          />
        ))}
      </span>
      <CupoCount free={free} capacity={capacity} />
    </span>
  )
}
