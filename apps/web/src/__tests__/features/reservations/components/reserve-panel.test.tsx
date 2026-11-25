import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { ReservePanel } from '@features/reservations/components/reserve-panel'
import type { ReservationController } from '@features/reservations/hooks/use-reservation'
import type { Reservation } from '@features/reservations/reservation-types'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const PARQUE_93 = MOCK_PARKINGS[0] as Parking
const ZONA_T = MOCK_PARKINGS[1] as Parking
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

type PanelOptions = Partial<ReservationController> & {
  parking?: Parking
  vehicle?: VehicleType
  reservedParkingName?: string
}

const renderPanel = ({
  parking = PARQUE_93,
  vehicle = 'CARRO',
  reservedParkingName,
  ...controller
}: PanelOptions = {}) => {
  const reserve = vi.fn()
  const onOpenParking = vi.fn()
  render(
    <ReservePanel
      parking={parking}
      vehicle={vehicle}
      controller={{ reservation: null, notice: null, reserving: false, reserve, ...controller }}
      reservedParkingName={reservedParkingName}
      onOpenParking={onOpenParking}
    />,
  )
  return { reserve, onOpenParking }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ReservePanel sin reserva', () => {
  it('reserva un cupo del parqueadero y del tipo de vehículo elegidos', () => {
    const { reserve } = renderPanel({ vehicle: 'MOTO' })

    fireEvent.click(screen.getByRole('button', { name: 'Reservar cupo' }))

    expect(reserve).toHaveBeenCalledWith('centro-93', 'MOTO')
  })

  it('mientras reserva lo dice y no deja enviar dos veces', () => {
    const { reserve } = renderPanel({ reserving: true })
    const button = screen.getByRole('button', { name: 'Reservando' })

    fireEvent.click(button)

    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(reserve).not.toHaveBeenCalled()
  })

  it('no ofrece reservar cuando no quedan cupos', () => {
    renderPanel({ parking: ZONA_T })

    expect(screen.queryByRole('button', { name: 'Reservar cupo' })).toBeNull()
    expect(screen.getByText(/No quedan cupos para carros/)).toBeDefined()
  })

  it.each([
    ['no-capacity', 'Sin cupos'],
    ['connection', 'No pudimos reservar'],
    ['expired', 'Tu reserva venció'],
    ['arrived', 'Llegaste a tu cupo'],
  ] as const)('explica el aviso "%s" sin mostrar códigos', (kind, title) => {
    renderPanel({ notice: { kind, parkingId: 'centro-93' } })

    expect(screen.getByText(title)).toBeDefined()
    expect(document.body.textContent).not.toMatch(/409|NO_CAPACITY|ACTIVE_RESERVATION/)
  })

  it('con la sesión vencida manda a iniciar sesión', () => {
    renderPanel({ notice: { kind: 'session', parkingId: 'centro-93' } })

    expect(screen.getByRole('link', { name: 'Iniciar sesión' }).getAttribute('href')).toBe('/login')
    expect(screen.queryByRole('button', { name: 'Reservar cupo' })).toBeNull()
  })

  it('no muestra el aviso de otro parqueadero', () => {
    renderPanel({ notice: { kind: 'no-capacity', parkingId: 'zona-t' } })

    expect(screen.queryByText('Sin cupos')).toBeNull()
  })
})

describe('ReservePanel con reserva', () => {
  it('muestra el tiquete con el espacio y los 15 minutos', () => {
    renderPanel({ reservation: RESERVATION })

    expect(screen.getByRole('timer').textContent).toBe('15:00')
    expect(screen.getByRole('timer').getAttribute('aria-label')).toBe('Quedan 15 minutos')
    expect(screen.getByText('C-07')).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Reservar cupo' })).toBeNull()
  })

  it('el contador baja cada segundo', () => {
    renderPanel({ reservation: RESERVATION })

    act(() => {
      vi.advanceTimersByTime(28_000)
    })

    expect(screen.getByRole('timer').textContent).toBe('14:32')
  })

  it('avisa cuando queda poco tiempo', () => {
    renderPanel({ reservation: RESERVATION })

    act(() => {
      vi.advanceTimersByTime(13 * 60 * 1000)
    })

    expect(screen.getByRole('timer').textContent).toBe('02:00')
    expect(screen.getByText('Queda poco')).toBeDefined()
  })

  it('en otro parqueadero dice dónde está la reserva y lleva a ella', () => {
    const { onOpenParking } = renderPanel({
      parking: ZONA_T,
      reservation: RESERVATION,
      reservedParkingName: 'Parque 93',
    })

    expect(screen.getByText(/Está en Parque 93/)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Ver mi reserva' }))

    expect(onOpenParking).toHaveBeenCalledWith('centro-93')
  })
})
