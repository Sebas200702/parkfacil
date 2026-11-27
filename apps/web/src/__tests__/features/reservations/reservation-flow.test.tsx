import { ParkingDetail } from '@features/parkings/components/parking-detail'
import { fetchParking, fetchParkings } from '@features/parkings/parking-api'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import type { Parking } from '@features/parkings/parking-types'
import { MyReservationsScreen } from '@features/reservations/components/my-reservations-screen'
import { useReservation } from '@features/reservations/hooks/use-reservation'
import type { Reservation } from '@features/reservations/reservation-types'
import { api } from '@lib/api'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@features/parkings/parking-api', () => ({
  fetchParking: vi.fn(),
  fetchParkings: vi.fn(),
}))
vi.mock('@lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const getMock = vi.mocked(api.get)
const postMock = vi.mocked(api.post)
const deleteMock = vi.mocked(api.delete)
const PARQUE_93 = MOCK_PARKINGS[0] as Parking

const activeReservation = (): Reservation => ({
  id: 'res-1',
  parqueaderoId: 'centro-93',
  espacioId: 'C-07',
  usuarioId: 'user-1',
  tipo: 'CARRO',
  estado: 'ACTIVA',
  creadaEn: new Date().toISOString(),
  venceEn: new Date(Date.now() + 900_000).toISOString(),
})

const ReservationDetail = () => {
  const reservations = useReservation()

  return (
    <ParkingDetail
      id={PARQUE_93.id}
      initial={PARQUE_93}
      vehicle="CARRO"
      onVehicleChange={vi.fn()}
      origin={null}
      reservations={reservations}
      onOpenParking={vi.fn()}
      onBack={vi.fn()}
    />
  )
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test')
  getMock.mockReset()
  postMock.mockReset()
  deleteMock.mockReset()
  vi.mocked(fetchParking).mockResolvedValue(PARQUE_93)
  vi.mocked(fetchParkings).mockResolvedValue(MOCK_PARKINGS)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('flujo de reservas con respuestas HTTP', () => {
  it('muestra Sin cupos ante un POST 409 y no crea un tiquete', async () => {
    getMock.mockResolvedValue({ data: [], status: 200, error: null })
    postMock.mockResolvedValue({
      data: null,
      status: 409,
      error: { code: 'NO_CAPACITY', message: 'Sin cupos' },
    })

    render(<ReservationDetail />)
    fireEvent.click(await screen.findByRole('button', { name: 'Reservar cupo' }))

    expect(await screen.findByText('Sin cupos')).toBeDefined()
    expect(postMock).toHaveBeenCalledWith('/reservas', {
      parqueaderoId: 'centro-93',
      tipo: 'CARRO',
    })
    expect(screen.queryByRole('timer')).toBeNull()
    expect(screen.queryByRole('heading', { name: /tu reserva/i })).toBeNull()
  })

  it('cancela por DELETE y mueve la reserva activa al historial como cancelada', async () => {
    const active = activeReservation()
    const cancelled = { ...active, estado: 'CANCELADA' as const }
    let reservations = [active]
    getMock.mockImplementation(async () => ({
      data: reservations,
      status: 200,
      error: null,
    }))
    deleteMock.mockImplementation(async () => {
      reservations = [cancelled]
      return { data: cancelled, status: 200, error: null }
    })

    render(<MyReservationsScreen />)
    await screen.findByRole('timer')
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar reserva' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, cancelar' }))

    expect(await screen.findByText('Reserva cancelada')).toBeDefined()
    expect(deleteMock).toHaveBeenCalledWith('/reservas/res-1')
    expect(screen.queryByRole('timer')).toBeNull()

    const history = await screen.findByRole('region', { name: 'Anteriores' })
    expect(within(history).getByText('Cancelada')).toBeDefined()
    expect(within(history).queryByText('Activa')).toBeNull()
  })
})
