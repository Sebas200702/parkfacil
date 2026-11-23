import type { Parking } from '@features/parkings/parking-types'
import { distanceMeters, type GeoPoint } from '@shared/utils/geo-util'

export type ParkingRow = {
  parking: Parking
  /** Metros desde la ubicación de la persona; null si no la conocemos. */
  meters: number | null
}

/**
 * Con ubicación, ordena del más cercano al más lejano. Sin ubicación deja el orden de la API.
 * Los parqueaderos llenos no se mandan al final ni se ocultan.
 */
export const toParkingRows = (parkings: Parking[], origin: GeoPoint | null): ParkingRow[] => {
  if (!origin) return parkings.map((parking) => ({ parking, meters: null }))

  return parkings
    .map((parking) => ({ parking, meters: distanceMeters(origin, parking) }))
    .sort((a, b) => a.meters - b.meters)
}
