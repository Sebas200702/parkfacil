import { fetchParking, fetchParkings } from '@features/parkings/parking-api'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import { api } from '@lib/api'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/api', () => ({ api: { get: vi.fn() } }))

const get = vi.mocked(api.get)
const PARQUE_93 = MOCK_PARKINGS[0]

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

describe('fetchParking', () => {
  it('sin URL de API busca en los datos de demostración', async () => {
    useDemoData()

    expect(await fetchParking('centro-93')).toBe(PARQUE_93)
    expect(await fetchParking('no-existe')).toBeNull()
  })

  it('pide GET /parqueaderos/{id} y devuelve el parqueadero', async () => {
    useRealApi()
    get.mockResolvedValue({ data: PARQUE_93, status: 200, error: null })

    const parking = await fetchParking('centro-93')

    expect(get).toHaveBeenCalledWith('/parqueaderos/centro-93', { signal: undefined })
    expect(parking).toEqual(PARQUE_93)
  })

  it('escapa el id antes de ponerlo en la ruta', async () => {
    useRealApi()
    get.mockResolvedValue({ data: PARQUE_93, status: 200, error: null })

    await fetchParking('a/b c')

    expect(get).toHaveBeenCalledWith('/parqueaderos/a%2Fb%20c', { signal: undefined })
  })

  it('devuelve null cuando la API responde 404', async () => {
    useRealApi()
    get.mockResolvedValue({
      data: null,
      status: 404,
      error: { code: 'NOT_FOUND', message: 'Parqueadero no encontrado' },
    })

    expect(await fetchParking('no-existe')).toBeNull()
  })

  it('falla con el mensaje de la API en cualquier otro error', async () => {
    useRealApi()
    get.mockResolvedValue({
      data: null,
      status: 0,
      error: { code: 'NETWORK_ERROR', message: 'Failed to fetch' },
    })

    await expect(fetchParking('centro-93')).rejects.toThrow('Failed to fetch')
  })
})
