import { fetchParkings } from '@features/parkings/parking-api'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import { api } from '@lib/api'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/api', () => ({ api: { get: vi.fn() } }))

const get = vi.mocked(api.get)

const useRealApi = () => vi.stubEnv('VITE_API_URL', 'https://api.example.test')
const useDemoData = () => vi.stubEnv('VITE_API_URL', '')

afterEach(() => {
  vi.unstubAllEnvs()
  get.mockReset()
})

describe('fetchParkings', () => {
  it('sin URL de API devuelve los datos de demostración sin llamar a la red', async () => {
    useDemoData()

    expect(await fetchParkings()).toBe(MOCK_PARKINGS)
    expect(get).not.toHaveBeenCalled()
  })

  it('pide GET /parqueaderos con el cliente compartido', async () => {
    useRealApi()
    get.mockResolvedValue({ data: MOCK_PARKINGS, status: 200, error: null })

    const parkings = await fetchParkings()

    expect(get).toHaveBeenCalledWith('/parqueaderos', { signal: undefined })
    expect(parkings).toEqual(MOCK_PARKINGS)
  })

  it('falla con el mensaje de la API cuando responde error', async () => {
    useRealApi()
    get.mockResolvedValue({
      data: null,
      status: 500,
      error: { code: 'INTERNAL', message: 'Error interno' },
    })

    await expect(fetchParkings()).rejects.toThrow('Error interno')
  })
})
