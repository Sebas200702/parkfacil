import { api } from '@lib/api'
import { MOCK_PARKINGS } from './parking-mocks'
import type { Parking } from './parking-types'

/** Sin URL de API el frontend trabaja con los datos de demostración. */
const isDemo = (): boolean => !import.meta.env.VITE_API_URL

/** GET /parqueaderos (público). */
export const fetchParkings = async (signal?: AbortSignal): Promise<Parking[]> => {
  if (isDemo()) return MOCK_PARKINGS

  const { data, error } = await api.get<Parking[]>('/parqueaderos', { signal })
  if (error || !data) throw new Error(error?.message ?? 'La API no devolvió parqueaderos')
  return data
}
