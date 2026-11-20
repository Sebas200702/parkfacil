import type { Parking, VehicleType } from '@domains/parkings/parking-types'
import { RESERVATION_MINUTES } from '@domains/reservations/reservation-consts'
import type { Reservation } from '@domains/reservations/reservation-types'
import { ErrorCodes } from '@shared/errors/codes'
import { ConflictError } from '@shared/errors/conflict-error'

/** Error 409 "Sin cupos" que exige la propuesta cuando no queda cupo. */
export const noCapacityError = () => new ConflictError(ErrorCodes.NO_CAPACITY, 'Sin cupos')

/** Hora de vencimiento de una reserva creada en `now`. */
export const computeExpiry = (now: Date): Date =>
  new Date(now.getTime() + RESERVATION_MINUTES * 60_000)

/** Un conductor solo puede tener una reserva activa a la vez. */
export const assertNoActiveReservation = (reservations: Reservation[]) => {
  const active = reservations.find((r) => r.estado === 'ACTIVA')
  if (active) {
    throw new ConflictError(ErrorCodes.ACTIVE_RESERVATION, 'Ya tienes una reserva activa', {
      reservaId: active.id,
    })
  }
}

/** Lanza 409 "Sin cupos" si el parqueadero no tiene cupo para el tipo de vehículo. */
export const assertHasCapacity = (parking: Parking, tipo: VehicleType) => {
  if ((parking.cupos[tipo] ?? 0) <= 0) throw noCapacityError()
}

/** Indica si la reserva ya pasó su hora de vencimiento. */
export const isDue = (reservation: Reservation, now: Date) =>
  new Date(reservation.venceEn).getTime() <= now.getTime()
