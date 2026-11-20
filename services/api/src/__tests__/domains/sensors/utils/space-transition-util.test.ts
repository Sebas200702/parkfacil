import { transitionForReading } from '@domains/sensors/utils/space-transition-util'
import { describe, expect, it } from 'vitest'

describe('transitionForReading', () => {
  it('LIBRE + OCUPADO descuenta un cupo y registra ENTRADA', () => {
    expect(transitionForReading('LIBRE', 'OCUPADO')).toEqual({
      changes: true,
      next: 'OCUPADO',
      capacityDelta: -1,
      fulfillsReservation: false,
      event: 'ENTRADA',
    })
  })

  it('OCUPADO + LIBRE devuelve el cupo y registra SALIDA', () => {
    expect(transitionForReading('OCUPADO', 'LIBRE')).toMatchObject({
      changes: true,
      next: 'LIBRE',
      capacityDelta: 1,
      event: 'SALIDA',
    })
  })

  it('RESERVADO + OCUPADO cumple la reserva sin descontar otra vez', () => {
    expect(transitionForReading('RESERVADO', 'OCUPADO')).toMatchObject({
      changes: true,
      next: 'OCUPADO',
      capacityDelta: 0,
      fulfillsReservation: true,
      event: 'ENTRADA',
    })
  })

  it.each([
    ['LIBRE', 'LIBRE'],
    ['OCUPADO', 'OCUPADO'],
    ['RESERVADO', 'LIBRE'],
  ] as const)('%s + %s no cambia nada', (current, reading) => {
    expect(transitionForReading(current, reading)).toMatchObject({
      changes: false,
      next: current,
      capacityDelta: 0,
      event: null,
    })
  })
})
