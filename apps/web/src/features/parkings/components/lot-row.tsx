import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { CupoMeter } from '@shared/ui/cupo-meter'
import { formatDistance } from '@shared/utils/geo-util'
import { formatPesos } from '@shared/utils/money-util'
import { MapPin } from 'lucide-react'

type LotRowProps = {
  parking: Parking
  vehicle: VehicleType
  /** Metros desde la ubicación de la persona; null si no la conocemos. */
  meters: number | null
  onOpen: (id: string) => void
}

/** Fila de la lista de parqueaderos. Toda la fila es un botón que abre el detalle. */
export const LotRow = ({ parking, vehicle, meters, onOpen }: LotRowProps) => {
  const rate = parking.tarifas[vehicle]

  return (
    <button
      type="button"
      onClick={() => onOpen(parking.id)}
      className="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2.5 border-concrete-200 border-b bg-paper p-4 text-left hover:bg-concrete-100 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus"
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
