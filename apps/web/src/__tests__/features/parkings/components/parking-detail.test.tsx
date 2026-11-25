import { ParkingDetail } from '@features/parkings/components/parking-detail'
import { fetchParking } from '@features/parkings/parking-api'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import type { Parking, VehicleType } from '@features/parkings/parking-types'
import type { ReservationController } from '@features/reservations/hooks/use-reservation'
import type { GeoPoint } from '@shared/utils/geo-util'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@features/parkings/parking-api', () => ({ fetchParking: vi.fn() }))

const fetchParkingMock = vi.mocked(fetchParking)
const PARQUE_93 = MOCK_PARKINGS[0] as Parking
const USAQUEN = MOCK_PARKINGS[2] as Parking

type DetailOptions = {
  parking?: Parking
  initial?: Parking | null
  vehicle?: VehicleType
  origin?: GeoPoint | null
  onVehicleChange?: (vehicle: VehicleType) => void
  onBack?: () => void
  reservations?: Partial<ReservationController>
}

const NO_RESERVATION: ReservationController = {
  reservation: null,
  notice: null,
  reserving: false,
  reserve: vi.fn(),
}

const renderDetail = ({
  parking = PARQUE_93,
  initial = parking,
  vehicle = 'CARRO',
  origin = null,
  onVehicleChange = vi.fn(),
  onBack = vi.fn(),
  reservations = {},
}: DetailOptions = {}) =>
  render(
    <ParkingDetail
      id={parking.id}
      initial={initial}
      vehicle={vehicle}
      onVehicleChange={onVehicleChange}
      origin={origin}
      reservations={{ ...NO_RESERVATION, ...reservations }}
      onOpenParking={vi.fn()}
      onBack={onBack}
    />,
  )

beforeEach(() => {
  fetchParkingMock.mockReset()
  fetchParkingMock.mockResolvedValue(PARQUE_93)
})

describe('ParkingDetail', () => {
  it('muestra de inmediato lo que la lista ya sabía: nombre, dirección, cupos y tarifas', () => {
    renderDetail()

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Parque 93')
    expect(screen.getByText('Calle 93A # 13-24')).toBeDefined()
    expect(screen.getByText('libres de 12', { exact: false })).toBeDefined()
    expect(screen.getAllByRole('definition').map((value) => value.textContent)).toEqual([
      '$4.000',
      '$1.000',
      '$30.000',
    ])
  })

  it('pide el parqueadero por su id y actualiza los cupos con el dato fresco', async () => {
    fetchParkingMock.mockResolvedValue({ ...PARQUE_93, cupos: { CARRO: 2, MOTO: 4 } })

    const { container } = renderDetail()

    await waitFor(() => expect(container.textContent).toContain('2libres de 12'))
    expect(fetchParkingMock).toHaveBeenCalledWith('centro-93', expect.any(AbortSignal))
  })

  it('muestra cupos y tarifas del tipo de vehículo elegido', () => {
    const { container } = renderDetail({ vehicle: 'MOTO' })

    expect(container.textContent).toContain('4libres de 4')
    expect(screen.getAllByRole('definition')[0]?.textContent).toBe('$2.000')
  })

  it('avisa el cambio de tipo de vehículo', () => {
    const onVehicleChange = vi.fn()
    renderDetail({ onVehicleChange })

    fireEvent.click(screen.getByRole('button', { name: 'Moto' }))

    expect(onVehicleChange).toHaveBeenCalledWith('MOTO')
  })

  it('dice cuando el parqueadero no recibe ese tipo de vehículo', () => {
    const soloCarros = { ...USAQUEN, capacidad: { CARRO: 8, MOTO: 0 } }
    fetchParkingMock.mockResolvedValue(soloCarros)

    renderDetail({ parking: soloCarros, vehicle: 'MOTO' })

    expect(screen.getByText('Este parqueadero no recibe motos.')).toBeDefined()
    expect(screen.queryByRole('definition')).toBeNull()
  })

  it('ofrece reservar un cupo del tipo de vehículo elegido', () => {
    const reserve = vi.fn()
    renderDetail({ vehicle: 'MOTO', reservations: { reserve } })

    fireEvent.click(screen.getByRole('button', { name: 'Reservar cupo' }))

    expect(reserve).toHaveBeenCalledWith('centro-93', 'MOTO')
  })

  it('con una reserva aquí muestra el tiquete y marca la bahía apartada', () => {
    const reservation = {
      id: 'res-1',
      parqueaderoId: 'centro-93',
      espacioId: 'C-07',
      usuarioId: 'user-1',
      tipo: 'CARRO' as const,
      estado: 'ACTIVA' as const,
      creadaEn: new Date().toISOString(),
      venceEn: new Date(Date.now() + 900_000).toISOString(),
    }

    const { container } = renderDetail({ reservations: { reservation } })

    expect(screen.getByRole('timer')).toBeDefined()
    expect(screen.getByText('C-07')).toBeDefined()
    expect(container.querySelectorAll('[data-state="held"]')).toHaveLength(1)
  })

  it('vuelve a pedir los cupos cuando cambia la reserva', async () => {
    const { rerender } = renderDetail()
    await waitFor(() => expect(fetchParkingMock).toHaveBeenCalledTimes(1))

    rerender(
      <ParkingDetail
        id={PARQUE_93.id}
        initial={PARQUE_93}
        vehicle="CARRO"
        onVehicleChange={vi.fn()}
        origin={null}
        reservations={{ ...NO_RESERVATION, notice: { kind: 'expired', parkingId: PARQUE_93.id } }}
        onOpenParking={vi.fn()}
        onBack={vi.fn()}
      />,
    )

    await waitFor(() => expect(fetchParkingMock).toHaveBeenCalledTimes(2))
  })

  it('añade la distancia cuando se conoce la ubicación', () => {
    renderDetail({ origin: { lat: 4.6767, lng: -74.0483 } })

    expect(screen.getByText('a 10 m', { exact: false })).toBeDefined()
  })

  it('enlaza la ruta hacia las coordenadas del parqueadero en otra pestaña', () => {
    renderDetail()

    const link = screen.getByRole('link', { name: 'Cómo llegar' })

    expect(link.getAttribute('href')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=4.6767,-74.0483',
    )
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('vuelve a la lista', () => {
    const onBack = vi.fn()
    renderDetail({ onBack })

    fireEvent.click(screen.getByRole('button', { name: 'Parqueaderos' }))

    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('lleva el foco al título al abrirse', () => {
    renderDetail()

    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
  })

  it('avisa cuando el parqueadero ya no existe y deja volver', async () => {
    const onBack = vi.fn()
    fetchParkingMock.mockResolvedValue(null)

    renderDetail({ onBack })

    expect(await screen.findByText('Este parqueadero ya no está')).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Ver parqueaderos' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('si no hay datos y la red falla ofrece reintentar', async () => {
    fetchParkingMock.mockRejectedValueOnce(new Error('Failed to fetch'))

    renderDetail({ initial: null })

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Parque 93' })).toBeDefined()
  })

  it('si un refresco falla conserva los últimos datos', async () => {
    fetchParkingMock.mockRejectedValue(new Error('Failed to fetch'))

    renderDetail()

    await waitFor(() => expect(fetchParkingMock).toHaveBeenCalled())
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Parque 93')
  })
})
