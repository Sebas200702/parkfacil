import { useParking } from '@features/parkings/hooks/use-parking'
import { fetchParking } from '@features/parkings/parking-api'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import type { Parking } from '@features/parkings/parking-types'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@features/parkings/parking-api', () => ({ fetchParking: vi.fn() }))

const fetchParkingMock = vi.mocked(fetchParking)
const PARQUE_93 = MOCK_PARKINGS[0] as Parking

beforeEach(() => {
  fetchParkingMock.mockReset()
})

describe('useParking', () => {
  it('arranca con el dato de la lista y lo reemplaza por el fresco', async () => {
    const fresh = { ...PARQUE_93, cupos: { CARRO: 1, MOTO: 0 } }
    fetchParkingMock.mockResolvedValue(fresh)

    const { result } = renderHook(() => useParking('centro-93', PARQUE_93))

    expect(result.current).toMatchObject({ status: 'ready', parking: PARQUE_93 })
    await waitFor(() => expect(result.current.parking).toEqual(fresh))
  })

  it('sin dato inicial empieza cargando y queda listo cuando llega', async () => {
    fetchParkingMock.mockResolvedValue(PARQUE_93)

    const { result } = renderHook(() => useParking('centro-93', null))

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.parking).toEqual(PARQUE_93)
  })

  it('marca no encontrado cuando el parqueadero ya no existe', async () => {
    fetchParkingMock.mockResolvedValue(null)

    const { result } = renderHook(() => useParking('centro-93', PARQUE_93))

    await waitFor(() => expect(result.current.status).toBe('not-found'))
    expect(result.current.parking).toBeNull()
  })

  it('marca error si la red falla y no había datos', async () => {
    fetchParkingMock.mockRejectedValue(new Error('Failed to fetch'))

    const { result } = renderHook(() => useParking('centro-93', null))

    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('conserva los datos si un refresco falla', async () => {
    fetchParkingMock.mockRejectedValue(new Error('Failed to fetch'))

    const { result } = renderHook(() => useParking('centro-93', PARQUE_93))

    await waitFor(() => expect(fetchParkingMock).toHaveBeenCalled())
    expect(result.current).toMatchObject({ status: 'ready', parking: PARQUE_93 })
  })
})
