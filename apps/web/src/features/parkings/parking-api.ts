import { withDemoReservation } from '@features/reservations/reservation-demo'
import { api } from '@lib/api'
import { MOCK_PARKINGS } from './parking-mocks'
import type { Parking } from './parking-types'

/** Sin URL de API el frontend trabaja con los datos de demostración. */
const isDemo = (): boolean => !process.env.NEXT_PUBLIC_API_URL

/** Datos de demostración, con el cupo descontado si hay una reserva de demostración activa. */
const demoParkings = (): Parking[] => {
  const parkings = MOCK_PARKINGS.map((parking) => withDemoReservation(parking))
  return parkings.every((parking, index) => parking === MOCK_PARKINGS[index])
    ? MOCK_PARKINGS
    : parkings
}

/** GET /parqueaderos (público). */
export const fetchParkings = async (signal?: AbortSignal): Promise<Parking[]> => {
  if (isDemo()) return demoParkings()

  const { data, error } = await api.get<Parking[]>('/parqueaderos', { signal })
  if (error || !data) throw new Error(error?.message ?? 'La API no devolvió parqueaderos')
  return data
}

/** GET /parqueaderos/{id} (público). Devuelve null cuando el parqueadero no existe (404). */
export const fetchParking = async (id: string, signal?: AbortSignal): Promise<Parking | null> => {
  if (isDemo()) return demoParkings().find((parking) => parking.id === id) ?? null

  const { data, status, error } = await api.get<Parking>(
    `/parqueaderos/${encodeURIComponent(id)}`,
    { signal },
  )
  if (status === 404) return null
  if (error || !data) throw new Error(error?.message ?? 'La API no devolvió el parqueadero')
  return data
}
