import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { RESERVATION_SECONDS } from './reservation-consts'
import type { CancelResult, Reservation, ReserveResult } from './reservation-types'

// Reservas de demostración: sin URL de API no hay backend, así que viven en la pestaña.
const STORAGE_KEY = 'parkfacil.demo.reservas'

/** Cuántas reservas de demostración se guardan para el historial. */
const HISTORY_SIZE = 10

const read = (): Reservation[] => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    const stored: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(stored) ? (stored as Reservation[]) : []
  } catch {
    return []
  }
}

const write = (reservations: Reservation[]): void => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
  } catch {
    // Sin almacenamiento (modo privado) la demostración sigue, solo no sobrevive a recargar.
  }
}

/** Marca como vencida la reserva activa a la que ya se le pasó la hora. */
const settle = (reservation: Reservation, now: number): Reservation =>
  reservation.estado === 'ACTIVA' && Date.parse(reservation.venceEn) <= now
    ? { ...reservation, estado: 'VENCIDA', finalizadaEn: reservation.venceEn }
    : reservation

/** Las reservas de demostración, de la más reciente a la más antigua. */
export const demoReservations = (now = Date.now()): Reservation[] =>
  read().map((reservation) => settle(reservation, now))

const findActive = (now: number): Reservation | undefined =>
  demoReservations(now).find((reservation) => reservation.estado === 'ACTIVA')

/** Imita POST /reservas, con los mismos dos rechazos 409 del backend. */
export const demoReserve = (
  parking: Parking | undefined,
  vehicle: VehicleType,
  now = Date.now(),
): ReserveResult => {
  if (findActive(now)) return { ok: false, problem: 'active-reservation' }
  if (!parking || parking.cupos[vehicle] <= 0) return { ok: false, problem: 'no-capacity' }

  const letter = vehicle === 'MOTO' ? 'M' : 'C'
  const reservation: Reservation = {
    id: `demo-${now}`,
    parqueaderoId: parking.id,
    espacioId: `${letter}-${String(parking.capacidad[vehicle]).padStart(2, '0')}`,
    usuarioId: 'demo',
    tipo: vehicle,
    estado: 'ACTIVA',
    creadaEn: new Date(now).toISOString(),
    venceEn: new Date(now + RESERVATION_SECONDS * 1000).toISOString(),
  }
  write([reservation, ...demoReservations(now)].slice(0, HISTORY_SIZE))
  return { ok: true, reservation }
}

/** Imita DELETE /reservas/{id}: solo se cancela una reserva que sigue activa. */
export const demoCancel = (id: string, now = Date.now()): CancelResult => {
  const reservations = demoReservations(now)
  const target = reservations.find((reservation) => reservation.id === id)
  if (target?.estado !== 'ACTIVA') return { ok: false, problem: 'not-active' }

  const cancelled: Reservation = {
    ...target,
    estado: 'CANCELADA',
    finalizadaEn: new Date(now).toISOString(),
  }
  write(reservations.map((reservation) => (reservation.id === id ? cancelled : reservation)))
  return { ok: true, reservation: cancelled }
}

/** Descuenta del parqueadero el cupo que la reserva de demostración tiene apartado. */
export const withDemoReservation = (parking: Parking, now = Date.now()): Parking => {
  const reservation = findActive(now)
  if (reservation?.parqueaderoId !== parking.id) return parking
  const { tipo } = reservation
  return { ...parking, cupos: { ...parking.cupos, [tipo]: Math.max(0, parking.cupos[tipo] - 1) } }
}
