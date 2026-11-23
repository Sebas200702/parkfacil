import type { SpaceState, VehicleType } from '@domains/parkings/parking-types'

export type SensorState = 'LIBRE' | 'OCUPADO'
export type EventKind = 'ENTRADA' | 'SALIDA'

export interface SensorReading {
  parqueaderoId: string
  espacioId: string
  estado: SensorState
  ocurridoEn: Date
}

export interface SpaceTransition {
  changes: boolean
  next: SpaceState
  /** Cambio a aplicar al contador de cupos del tipo de vehículo. */
  capacityDelta: -1 | 0 | 1
  /** El carro con reserva llegó a su espacio: la reserva pasa a CUMPLIDA. */
  fulfillsReservation: boolean
  event: EventKind | null
}

export interface OccupancyEvent {
  parqueaderoId: string
  espacioId: string
  tipo: EventKind
  tipoVehiculo: VehicleType
  ocurridoEn: string
  monto?: number
}

export interface ReadingResult {
  cambio: boolean
  estado: SpaceState
}

export interface TransitionWrite {
  reading: SensorReading
  previous: SpaceState
  tipo: VehicleType
  transition: SpaceTransition
  reservaId: string | undefined
  event: OccupancyEvent | null
}
