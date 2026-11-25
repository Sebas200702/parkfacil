import { fetchParking } from '@features/parkings/parking-api'
import { createReservation, fetchMyReservations } from '@features/reservations/reservation-api'
import type { Reservation } from '@features/reservations/reservation-types'
import { api } from '@lib/api'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

const get = vi.mocked(api.get)
const post = vi.mocked(api.post)

const RESERVATION: Reservation = {
  id: 'res-1',
  parqueaderoId: 'centro-93',
  espacioId: 'C-07',
  usuarioId: 'user-1',
  tipo: 'CARRO',
  estado: 'ACTIVA',
  creadaEn: '2026-11-25T15:00:00.000Z',
  venceEn: '2026-11-25T15:15:00.000Z',
}

const rejected = (status: number, code: string) => ({
  data: null,
  status,
  error: { code, message: code },
})

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(() => {
  vi.unstubAllEnvs()
  get.mockReset()
  post.mockReset()
})

describe('createReservation con la API', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test')
  })

  it('envía el parqueadero y el tipo de vehículo a POST /reservas', async () => {
    post.mockResolvedValue({ data: RESERVATION, status: 201, error: null })

    const result = await createReservation('centro-93', 'CARRO')

    expect(post).toHaveBeenCalledWith('/reservas', { parqueaderoId: 'centro-93', tipo: 'CARRO' })
    expect(result).toEqual({ ok: true, reservation: RESERVATION })
  })

  it.each([
    [409, 'NO_CAPACITY', 'no-capacity'],
    [409, 'ACTIVE_RESERVATION', 'active-reservation'],
    [401, 'UNAUTHORIZED', 'session'],
    [500, 'INTERNAL', 'connection'],
    [0, 'NETWORK_ERROR', 'connection'],
  ])('traduce el rechazo %i %s a "%s"', async (status, code, problem) => {
    post.mockResolvedValue(rejected(status, code))

    expect(await createReservation('centro-93', 'CARRO')).toEqual({ ok: false, problem })
  })
})

describe('fetchMyReservations con la API', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test')
  })

  it('pide GET /reservas/mias', async () => {
    get.mockResolvedValue({ data: [RESERVATION], status: 200, error: null })

    expect(await fetchMyReservations()).toEqual([RESERVATION])
    expect(get).toHaveBeenCalledWith('/reservas/mias', { signal: undefined })
  })

  it('falla con el mensaje de la API cuando responde error', async () => {
    get.mockResolvedValue(rejected(500, 'Error interno'))

    await expect(fetchMyReservations()).rejects.toThrow('Error interno')
  })
})

describe('reservas de demostración (sin URL de API)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '')
  })

  it('aparta un cupo por 15 minutos sin llamar a la red', async () => {
    const result = await createReservation('centro-93', 'CARRO')

    expect(post).not.toHaveBeenCalled()
    expect(result.ok).toBe(true)
    const [mine] = await fetchMyReservations()
    expect(mine?.estado).toBe('ACTIVA')
    expect(Date.parse(mine?.venceEn ?? '') - Date.parse(mine?.creadaEn ?? '')).toBe(900_000)
  })

  it('descuenta el cupo apartado del parqueadero', async () => {
    await createReservation('centro-93', 'CARRO')

    expect((await fetchParking('centro-93'))?.cupos.CARRO).toBe(4)
  })

  it('rechaza una segunda reserva mientras la primera sigue activa', async () => {
    await createReservation('centro-93', 'CARRO')

    expect(await createReservation('usaquen', 'CARRO')).toEqual({
      ok: false,
      problem: 'active-reservation',
    })
  })

  it('rechaza reservar donde no quedan cupos', async () => {
    expect(await createReservation('zona-t', 'CARRO')).toEqual({
      ok: false,
      problem: 'no-capacity',
    })
  })
})
