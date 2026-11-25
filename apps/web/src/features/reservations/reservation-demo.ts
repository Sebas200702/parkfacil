import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { RESERVATION_SECONDS } from './reservation-consts'
import type { Reservation, ReserveResult } from './reservation-types'

// Reservas de demostración: sin URL de API no hay backend, así que la reserva vive en la pestaña.
const STORAGE_KEY = 'parkfacil.demo.reserva'

const read = (): Reservation | null => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Reservation) : null
  } catch {
    return null
  }
}

const write = (reservation: Reservation | null): void => {
  try {
    if (reservation) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reservation))
    else window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Sin almacenamiento (modo privado) la demostración sigue, solo no sobrevive a recargar.
  }
}

/** La reserva de demostración, ya marcada como vencida si se le pasó la hora. */
export const demoReservations = (now = Date.now()): Reservation[] => {
  const reservation = read()
  if (!reservation) return []
  const expired = reservation.estado === 'ACTIVA' && Date.parse(reservation.venceEn) <= now
  return [expired ? { ...reservation, estado: 'VENCIDA' } : reservation]
}

const isActive = (reservation: Reservation | undefined): reservation is Reservation =>
  reservation?.estado === 'ACTIVA'

/** Imita POST /reservas, con los mismos dos rechazos 409 del backend. */
export const demoReserve = (
  parking: Parking | undefined,
  vehicle: VehicleType,
  now = Date.now(),
): ReserveResult => {
  if (isActive(demoReservations(now)[0])) return { ok: false, problem: 'active-reservation' }
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
  write(reservation)
  return { ok: true, reservation }
}

/** Descuenta del parqueadero el cupo que la reserva de demostración tiene apartado. */
export const withDemoReservation = (parking: Parking, now = Date.now()): Parking => {
  const reservation = demoReservations(now)[0]
  if (!isActive(reservation) || reservation.parqueaderoId !== parking.id) return parking
  const { tipo } = reservation
  return { ...parking, cupos: { ...parking.cupos, [tipo]: Math.max(0, parking.cupos[tipo] - 1) } }
}
