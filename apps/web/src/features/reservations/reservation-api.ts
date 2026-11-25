import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import type { VehicleType } from '@features/parkings/parking-types'
import { api } from '@lib/api'
import { demoCancel, demoReservations, demoReserve, withDemoReservation } from './reservation-demo'
import type {
  CancelProblem,
  CancelResult,
  Reservation,
  ReserveProblem,
  ReserveResult,
} from './reservation-types'

/** Sin URL de API el frontend trabaja con los datos de demostración. */
const isDemo = (): boolean => !process.env.NEXT_PUBLIC_API_URL

const toProblem = (status: number, code: string | undefined): ReserveProblem => {
  if (status === 409) return code === 'ACTIVE_RESERVATION' ? 'active-reservation' : 'no-capacity'
  if (status === 401 || status === 403) return 'session'
  return 'connection'
}

/**
 * POST /reservas: aparta un cupo por 15 minutos. Los rechazos esperados (409 sin cupos,
 * 409 ya tienes una reserva) vuelven como resultado, no como excepción, para poder explicarlos.
 */
export const createReservation = async (
  parkingId: string,
  vehicle: VehicleType,
): Promise<ReserveResult> => {
  if (isDemo()) {
    const parking = MOCK_PARKINGS.find((item) => item.id === parkingId)
    return demoReserve(parking ? withDemoReservation(parking) : undefined, vehicle)
  }

  const { data, status, error } = await api.post<Reservation>('/reservas', {
    parqueaderoId: parkingId,
    tipo: vehicle,
  })
  if (error || !data) return { ok: false, problem: toProblem(status, error?.code) }
  return { ok: true, reservation: data }
}

const toCancelProblem = (status: number): CancelProblem => {
  // 409: ya no estaba activa. 404: no existe o no es de esta persona. En ambos casos no hay qué cancelar.
  if (status === 409 || status === 404) return 'not-active'
  if (status === 401 || status === 403) return 'session'
  return 'connection'
}

/** DELETE /reservas/{id}: cancela una reserva propia y libera el cupo. */
export const cancelReservation = async (id: string): Promise<CancelResult> => {
  if (isDemo()) return demoCancel(id)

  const { data, status, error } = await api.delete<Reservation>(
    `/reservas/${encodeURIComponent(id)}`,
  )
  if (error || !data) return { ok: false, problem: toCancelProblem(status) }
  return { ok: true, reservation: data }
}

/** GET /reservas/mias: las reservas de quien tiene la sesión, de la más reciente a la más antigua. */
export const fetchMyReservations = async (signal?: AbortSignal): Promise<Reservation[]> => {
  if (isDemo()) return demoReservations()

  const { data, error } = await api.get<Reservation[]>('/reservas/mias', { signal })
  if (error || !data) throw new Error(error?.message ?? 'La API no devolvió las reservas')
  return data
}
