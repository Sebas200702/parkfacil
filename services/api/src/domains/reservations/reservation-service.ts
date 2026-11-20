import { randomUUID } from 'node:crypto'
import { sendReservationConfirmation } from '@domains/notifications/notification-service'
import { listSpaces, requireParking } from '@domains/parkings/parking-service'
import type { Db } from '@shared/db/db-types'
import { ErrorCodes } from '@shared/errors/codes'
import { ConflictError } from '@shared/errors/conflict-error'
import { NotFoundError } from '@shared/errors/not-found-error'
import { scheduleExpiry } from './expiry-scheduler-service'
import { MAX_SPACE_ATTEMPTS } from './reservation-consts'
import * as repo from './reservation-repository'
import type { ExpiryTarget, NewReservation, Reservation } from './reservation-types'
import {
  assertHasCapacity,
  assertNoActiveReservation,
  computeExpiry,
  isDue,
  noCapacityError,
} from './utils/reservation-rules-util'

const buildReservation = (input: NewReservation, espacioId: string, now: Date): Reservation => ({
  id: randomUUID(),
  parqueaderoId: input.parqueaderoId,
  espacioId,
  usuarioId: input.usuarioId,
  tipo: input.tipo,
  estado: 'ACTIVA',
  creadaEn: now.toISOString(),
  venceEn: computeExpiry(now).toISOString(),
})

/**
 * Reserva un cupo por 15 minutos. La transacción solo descuenta el cupo si cupos > 0;
 * si otro conductor tomó el mismo espacio, prueba con el siguiente libre. Sin cupo: 409 "Sin cupos".
 * Después programa el vencimiento y envía el correo (ambos best-effort).
 */
export const createReservation = async (db: Db, input: NewReservation): Promise<Reservation> => {
  const now = input.now ?? new Date()
  assertNoActiveReservation(await repo.listByUser(db, input.usuarioId))
  const parking = await requireParking(db, input.parqueaderoId)
  assertHasCapacity(parking, input.tipo)

  const free = (await listSpaces(db, input.parqueaderoId)).filter(
    (s) => s.estado === 'LIBRE' && s.tipo === input.tipo,
  )
  for (const space of free.slice(0, MAX_SPACE_ATTEMPTS)) {
    const reservation = buildReservation(input, space.id, now)
    const outcome = await repo.insertReservation(db, reservation)
    if (outcome === 'NO_CAPACITY') throw noCapacityError()
    if (outcome === 'SPACE_TAKEN') continue
    await Promise.all([
      scheduleExpiry(reservation),
      input.email
        ? sendReservationConfirmation({
            to: input.email,
            parkingName: parking.nombre,
            espacioId: space.id,
            venceEn: reservation.venceEn,
          })
        : Promise.resolve(false),
    ])
    return reservation
  }
  throw noCapacityError()
}

/** Reservas del usuario, de la más reciente a la más antigua. */
export const listMyReservations = (db: Db, userId: string) => repo.listByUser(db, userId)

/** Cancela una reserva activa del usuario. Si no es suya responde 404 para no revelarla. */
export const cancelReservation = async (db: Db, userId: string, id: string, now = new Date()) => {
  const reservation = (await repo.listByUser(db, userId)).find((r) => r.id === id)
  if (!reservation) throw new NotFoundError('Reserva')
  const iso = now.toISOString()
  const closed =
    reservation.estado === 'ACTIVA' &&
    (await repo.closeReservation(db, reservation, 'CANCELADA', iso))
  if (!closed) {
    throw new ConflictError(ErrorCodes.RESERVATION_NOT_ACTIVE, 'La reserva no está activa', {
      estado: reservation.estado,
    })
  }
  return { ...reservation, estado: 'CANCELADA' as const, finalizadaEn: iso }
}

/** Vence la reserva si sigue activa y ya pasó su hora. Idempotente. */
export const expireIfDue = async (db: Db, target: ExpiryTarget, now = new Date()) => {
  const reservation = await repo.getReservation(db, target.parqueaderoId, target.reservaId)
  if (reservation?.estado !== 'ACTIVA' || !isDue(reservation, now)) return false
  return repo.closeReservation(db, reservation, 'VENCIDA', now.toISOString())
}

/** Vence todas las reservas activas cuya hora ya pasó. Devuelve cuántas venció. */
export const expireAllDue = async (db: Db, now = new Date()): Promise<number> => {
  const due = await repo.listDue(db, now.toISOString())
  const results = await Promise.all(
    due.map((r) => repo.closeReservation(db, r, 'VENCIDA', now.toISOString())),
  )
  return results.filter(Boolean).length
}
