import { LotRow } from '@features/parkings/components/lot-row'
import { MOCK_PARKINGS } from '@features/parkings/parking-mocks'
import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const PARQUE_93 = MOCK_PARKINGS[0] as Parking

type RowOptions = {
  vehicle?: VehicleType
  meters?: number | null
  selected?: boolean
  onSelect?: (id: string) => void
}

const renderRow = ({
  vehicle = 'CARRO',
  meters = null,
  selected = false,
  onSelect = vi.fn(),
}: RowOptions = {}) =>
  render(
    <LotRow
      parking={PARQUE_93}
      vehicle={vehicle}
      meters={meters}
      selected={selected}
      onSelect={onSelect}
    />,
  )

describe('LotRow', () => {
  it('muestra nombre, dirección, tarifa por hora y cupos del tipo elegido', () => {
    renderRow()

    const row = screen.getByRole('button')

    expect(row.textContent).toContain('Parque 93')
    expect(row.textContent).toContain('Calle 93A # 13-24')
    expect(row.textContent).toContain('$4.000/h')
    expect(row.textContent).toContain('5libres de 12')
  })

  it('cambia tarifa y cupos al elegir moto', () => {
    renderRow({ vehicle: 'MOTO' })

    const row = screen.getByRole('button')

    expect(row.textContent).toContain('$2.000/h')
    expect(row.textContent).toContain('4libres de 4')
  })

  it('añade la distancia cuando se conoce la ubicación', () => {
    renderRow({ meters: 347 })

    expect(screen.getByRole('button').textContent).toContain('· a 350 m')
  })

  it('avisa qué parqueadero se eligió', () => {
    const onSelect = vi.fn()
    renderRow({ onSelect })

    fireEvent.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith('centro-93')
  })

  it('marca la fila elegida', () => {
    renderRow({ selected: true })

    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true')
  })
})
