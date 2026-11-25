import { fetchParkings } from '@features/parkings/parking-api'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import { MyReservationsScreen } from '@features/reservations/components/my-reservations-screen'
import { cancelReservation, fetchMyReservations } from '@features/reservations/reservation-api'
import type { Reservation } from '@features/reservations/reservation-types'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@features/parkings/parking-api', () => ({ fetchParkings: vi.fn() }))
vi.mock('@features/reservations/reservation-api', () => ({
  cancelReservation: vi.fn(),
  createReservation: vi.fn(),
  fetchMyReservations: vi.fn(),
}))

const fetchMock = vi.mocked(fetchMyReservations)
const cancelMock = vi.mocked(cancelReservation)

const reservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'res-1',
  parqueaderoId: 'centro-93',
  espacioId: 'C-07',
  usuarioId: 'user-1',
  tipo: 'CARRO',
  estado: 'ACTIVA',
  creadaEn: new Date().toISOString(),
  venceEn: new Date(Date.now() + 900_000).toISOString(),
  ...overrides,
})

const PAST = [
  reservation({ id: 'res-2', estado: 'CUMPLIDA', espacioId: 'C-02' }),
  reservation({ id: 'res-3', estado: 'VENCIDA', parqueaderoId: 'usaquen', tipo: 'MOTO' }),
  reservation({ id: 'res-4', estado: 'CANCELADA', parqueaderoId: 'ya-no-existe' }),
]

beforeEach(() => {
  fetchMock.mockReset()
  cancelMock.mockReset()
  vi.mocked(fetchParkings).mockResolvedValue(MOCK_PARKINGS)
})

describe('MyReservationsScreen', () => {
  it('sin reservas invita a buscar parqueadero', async () => {
    fetchMock.mockResolvedValue([])

    render(<MyReservationsScreen />)

    expect(await screen.findByText('Aún no tienes reservas')).toBeDefined()
    expect(screen.getByRole('link', { name: 'Buscar parqueadero' }).getAttribute('href')).toBe(
      '/mapa',
    )
  })

  it('muestra la reserva activa con su parqueadero, contador y espacio', async () => {
    fetchMock.mockResolvedValue([reservation(), ...PAST])

    render(<MyReservationsScreen />)

    const active = within(await screen.findByRole('region', { name: 'Parque 93' }))

    expect(active.getByRole('timer')).toBeDefined()
    expect(active.getByText('C-07')).toBeDefined()
  })

  it('lista las anteriores en orden, con su estado en palabras', async () => {
    fetchMock.mockResolvedValue([reservation(), ...PAST])

    render(<MyReservationsScreen />)

    const history = await screen.findByRole('region', { name: 'Anteriores' })
    const rows = within(history).getAllByRole('listitem')

    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringMatching(/^Parque 93Carro · espacio C-02Cumplida/),
      expect.stringMatching(/^Usaquén PlazaMoto · espacio C-07Vencida/),
      expect.stringMatching(/^ya-no-existeCarro · espacio C-07Cancelada/),
    ])
  })

  it('no repite la reserva activa en el historial', async () => {
    fetchMock.mockResolvedValue([reservation()])

    render(<MyReservationsScreen />)

    await screen.findByRole('timer')
    expect(screen.queryByRole('region', { name: 'Anteriores' })).toBeNull()
  })

  it('cancela tras confirmar y pasa la reserva al historial', async () => {
    const active = reservation()
    const cancelled = { ...active, estado: 'CANCELADA' as const }
    fetchMock.mockResolvedValue([active])
    cancelMock.mockResolvedValue({ ok: true, reservation: cancelled })
    render(<MyReservationsScreen />)

    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar reserva' }))
    fetchMock.mockResolvedValue([cancelled])
    fireEvent.click(screen.getByRole('button', { name: 'Sí, cancelar' }))

    expect(await screen.findByText('Reserva cancelada')).toBeDefined()
    expect(cancelMock).toHaveBeenCalledWith('res-1')
    expect(screen.queryByRole('timer')).toBeNull()
    const history = await screen.findByRole('region', { name: 'Anteriores' })
    expect(within(history).getByText('Cancelada')).toBeDefined()
  })

  it('si la red falla ofrece reintentar', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Failed to fetch'))
    fetchMock.mockRejectedValueOnce(new Error('Failed to fetch'))
    render(<MyReservationsScreen />)

    fetchMock.mockResolvedValue(PAST)
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('region', { name: 'Anteriores' })).toBeDefined()
  })

  it('enlaza de vuelta al mapa', async () => {
    fetchMock.mockResolvedValue([])

    render(<MyReservationsScreen />)

    expect(screen.getByRole('link', { name: 'Parqueaderos' }).getAttribute('href')).toBe('/mapa')
    await screen.findByText('Aún no tienes reservas')
  })
})
