import { useReservation } from '@features/reservations/hooks/use-reservation'
import { createReservation, fetchMyReservations } from '@features/reservations/reservation-api'
import type { Reservation } from '@features/reservations/reservation-types'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@features/reservations/reservation-api', () => ({
  createReservation: vi.fn(),
  fetchMyReservations: vi.fn(),
}))

const createMock = vi.mocked(createReservation)
const fetchMock = vi.mocked(fetchMyReservations)

const NOW = Date.parse('2026-11-25T15:00:00.000Z')

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

/** Monta el hook y deja resolver la consulta inicial de reservas. */
const mount = async () => {
  const view = renderHook(() => useReservation())
  await act(async () => {})
  return view
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  fetchMock.mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
  createMock.mockReset()
  fetchMock.mockReset()
})

describe('useReservation', () => {
  it('recupera la reserva activa al entrar', async () => {
    fetchMock.mockResolvedValue([RESERVATION])

    const { result } = await mount()

    expect(result.current.reservation).toEqual(RESERVATION)
  })

  it('ignora reservas que ya no están activas', async () => {
    fetchMock.mockResolvedValue([{ ...RESERVATION, estado: 'CANCELADA' }])

    const { result } = await mount()

    expect(result.current.reservation).toBeNull()
  })

  it('guarda la reserva recién creada', async () => {
    createMock.mockResolvedValue({ ok: true, reservation: RESERVATION })
    const { result } = await mount()

    await act(() => result.current.reserve('centro-93', 'CARRO'))

    expect(createMock).toHaveBeenCalledWith('centro-93', 'CARRO')
    expect(result.current.reservation).toEqual(RESERVATION)
    expect(result.current.notice).toBeNull()
  })

  it('deja un aviso en ese parqueadero cuando no hay cupos', async () => {
    createMock.mockResolvedValue({ ok: false, problem: 'no-capacity' })
    const { result } = await mount()

    await act(() => result.current.reserve('zona-t', 'CARRO'))

    expect(result.current.reservation).toBeNull()
    expect(result.current.notice).toEqual({ kind: 'no-capacity', parkingId: 'zona-t' })
    expect(result.current.reserving).toBe(false)
  })

  it('si ya había una reserva activa la trae para mostrarla', async () => {
    createMock.mockResolvedValue({ ok: false, problem: 'active-reservation' })
    const { result } = await mount()
    fetchMock.mockResolvedValue([RESERVATION])

    await act(() => result.current.reserve('usaquen', 'CARRO'))

    expect(result.current.reservation).toEqual(RESERVATION)
  })

  it('suelta la reserva justo cuando pasan los 15 minutos', async () => {
    fetchMock.mockResolvedValue([RESERVATION])
    const { result } = await mount()
    fetchMock.mockRejectedValue(new Error('sin red'))

    await act(() => vi.advanceTimersByTimeAsync(15 * 60 * 1000))

    expect(result.current.reservation).toBeNull()
    expect(result.current.notice).toEqual({ kind: 'expired', parkingId: 'centro-93' })
  })

  it('avisa la llegada cuando la API marca la reserva como cumplida', async () => {
    fetchMock.mockResolvedValue([RESERVATION])
    const { result } = await mount()
    fetchMock.mockResolvedValue([{ ...RESERVATION, estado: 'CUMPLIDA' }])

    await act(() => vi.advanceTimersByTimeAsync(20_000))

    expect(result.current.reservation).toBeNull()
    expect(result.current.notice).toEqual({ kind: 'arrived', parkingId: 'centro-93' })
  })

  it('conserva la reserva si una consulta falla', async () => {
    fetchMock.mockResolvedValue([RESERVATION])
    const { result } = await mount()
    fetchMock.mockRejectedValue(new Error('sin red'))

    await act(() => vi.advanceTimersByTimeAsync(20_000))

    expect(result.current.reservation).toEqual(RESERVATION)
  })
})
