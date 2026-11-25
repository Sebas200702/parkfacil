import { VEHICLE_PLURAL } from '@features/parkings/parking-consts'
import type { VehicleType } from '@features/parkings/parking-types'
import { planBays } from '@features/parkings/utils/lot-plan-util'
import { BayMap } from '@shared/ui/bay-map'
import { CupoCount } from '@shared/ui/cupo-meter'

type LotPlanProps = {
  free: number
  capacity: number
  vehicle: VehicleType
}

/**
 * El parqueadero visto desde arriba, con un carro o una moto en cada bahía ocupada.
 * Es un resumen de los conteos: la cifra exacta va en texto debajo.
 */
export const LotPlan = ({ free, capacity, vehicle }: LotPlanProps) => (
  <div className="grid gap-2">
    <BayMap
      compact
      summary
      label={`Dibujo del parqueadero: ${Math.max(0, free)} libres de ${capacity} para ${VEHICLE_PLURAL[vehicle]}`}
      bays={planBays(free, capacity, vehicle === 'MOTO' ? 'moto' : 'car')}
    />
    <CupoCount free={free} capacity={capacity} />
    <p className="text-caption text-asphalt-600">
      El dibujo es ilustrativo: no muestra la posición real de cada cupo.
    </p>
  </div>
)
