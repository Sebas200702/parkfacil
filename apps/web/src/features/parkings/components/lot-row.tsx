import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { CupoMeter } from '@shared/ui/cupo-meter'
import { cx } from '@shared/utils/cx'
import { formatDistance } from '@shared/utils/geo-util'
import { formatPesos } from '@shared/utils/money-util'
import { MapPin } from 'lucide-react'
import { useEffect, useRef } from 'react'

type LotRowProps = {
  parking: Parking
  vehicle: VehicleType
  /** Metros desde la ubicación de la persona; null si no la conocemos. */
  meters: number | null
  selected: boolean
  onSelect: (id: string) => void
}

/** Fila de la lista de parqueaderos: nombre, dirección, tarifa por hora y medidor de cupos. */
export const LotRow = ({ parking, vehicle, meters, selected, onSelect }: LotRowProps) => {
  const ref = useRef<HTMLButtonElement>(null)
  const rate = parking.tarifas[vehicle]

  // Al elegir una placa en el mapa, su fila queda a la vista.
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [selected])

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(parking.id)}
      className={cx(
        'grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2.5 border-concrete-200 border-b p-4 text-left focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus',
        // Pasar el cursor y estar elegida se ven distinto: gris al pasar, violeta con filete al elegir.
        selected
          ? 'bg-brand-100 inset-ring-2 inset-ring-brand-600'
          : 'bg-paper hover:bg-concrete-100',
      )}
    >
      <span className="grid gap-0.5">
        <span className="text-heading">{parking.nombre}</span>
        <span className="flex items-center gap-1 text-caption text-asphalt-600">
          <MapPin aria-hidden="true" size={16} strokeWidth={2.25} className="shrink-0" />
          {parking.direccion}
          {meters === null ? '' : ` · ${formatDistance(meters)}`}
        </span>
      </span>
      {rate ? (
        <span className="whitespace-nowrap font-mono text-data tabular-nums">
          {formatPesos(rate.valorHora)}/h
        </span>
      ) : null}
      <span className="col-span-2">
        <CupoMeter free={parking.cupos[vehicle]} capacity={parking.capacidad[vehicle]} />
      </span>
    </button>
  )
}
