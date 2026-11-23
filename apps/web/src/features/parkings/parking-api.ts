import { MOCK_PARKINGS } from './parking-mocks'
import type { ApiEnvelope, Parking } from './parking-types'

const API_URL = import.meta.env.VITE_API_URL

/**
 * GET /parqueaderos (público). Sin URL de API devuelve los datos de demostración,
 * para avanzar mientras el lab no esté desplegado.
 */
export const fetchParkings = async (
  signal?: AbortSignal,
  apiUrl: string | undefined = API_URL,
): Promise<Parking[]> => {
  if (!apiUrl) return MOCK_PARKINGS

  const response = await fetch(`${apiUrl}/parqueaderos`, { signal })
  const body = (await response.json()) as ApiEnvelope<Parking[]>

  if (!response.ok || body.error) {
    throw new Error(body.error?.message ?? `La API respondió ${response.status}`)
  }
  return body.data
}
