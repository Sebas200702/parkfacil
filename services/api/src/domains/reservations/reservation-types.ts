import type { VehicleType } from '@domains/parkings/parking-types'

export type ReservationState = 'ACTIVA' | 'CUMPLIDA' | 'VENCIDA' | 'CANCELADA'
export type ClosingState = 'VENCIDA' | 'CANCELADA'
export type InsertOutcome = 'OK' | 'NO_CAPACITY' | 'SPACE_TAKEN'

export interface Reservation {
  id: string
  parqueaderoId: string
  espacioId: string
  usuarioId: string
  tipo: VehicleType
  estado: ReservationState
  creadaEn: string
  venceEn: string
  finalizadaEn?: string
}

export interface NewReservation {
  parqueaderoId: string
  tipo: VehicleType
  usuarioId: string
  email?: string | undefined
  now?: Date
}

export interface ExpiryTarget {
  parqueaderoId: string
  reservaId: string
}
