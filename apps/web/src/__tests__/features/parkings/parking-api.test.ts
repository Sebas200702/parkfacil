import { fetchParkings } from '@features/parkings/parking-api'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import { afterEach, describe, expect, it, vi } from 'vitest'

const API_URL = 'https://api.example.test'

const respondWith = (status: number, body: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }),
  )

afterEach(() => vi.unstubAllGlobals())

describe('fetchParkings', () => {
  it('sin URL de API devuelve los datos de demostración', async () => {
    expect(await fetchParkings(undefined, '')).toBe(MOCK_PARKINGS)
  })

  it('pide GET /parqueaderos y desempaca data', async () => {
    respondWith(200, { data: MOCK_PARKINGS, status: 200, error: null })

    const parkings = await fetchParkings(undefined, API_URL)

    expect(fetch).toHaveBeenCalledWith(`${API_URL}/parqueaderos`, { signal: undefined })
    expect(parkings).toEqual(MOCK_PARKINGS)
  })

  it('falla con el mensaje de la API cuando responde error', async () => {
    respondWith(500, {
      data: null,
      status: 500,
      error: { code: 'INTERNAL', message: 'Error interno' },
    })

    await expect(fetchParkings(undefined, API_URL)).rejects.toThrow('Error interno')
  })
})
