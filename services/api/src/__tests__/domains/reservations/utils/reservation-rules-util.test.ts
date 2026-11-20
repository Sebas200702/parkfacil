import type { Parking } from '@domains/parkings/parking-types'
import type { Reservation } from '@domains/reservations/reservation-types'
import {
  assertHasCapacity,
  assertNoActiveReservation,
  computeExpiry,
  isDue,
} from '@domains/reservations/utils/reservation-rules-util'
import { describe, expect, it } from 'vitest'

const reservation = (estado: Reservation['estado'], venceEn = '2026-11-20T10:15:00.000Z') =>
  ({ id: 'r1', estado, venceEn }) as Reservation

describe('reservation rules', () => {
  it('vence 15 minutos después de creada', () => {
    expect(computeExpiry(new Date('2026-11-20T10:00:00.000Z')).toISOString()).toBe(
      '2026-11-20T10:15:00.000Z',
    )
  })

  it('rechaza con 409 si el conductor ya tiene una reserva activa', () => {
    expect(() => assertNoActiveReservation([reservation('ACTIVA')])).toThrowError(
      expect.objectContaining({ status: 409, code: 'ACTIVE_RESERVATION' }),
    )
    expect(() => assertNoActiveReservation([reservation('VENCIDA')])).not.toThrow()
  })

  it('responde 409 "Sin cupos" cuando el tipo no tiene cupo', () => {
    const parking = { cupos: { CARRO: 0, MOTO: 3 } } as unknown as Parking
    expect(() => assertHasCapacity(parking, 'CARRO')).toThrowError(
      expect.objectContaining({ status: 409, code: 'NO_CAPACITY', message: 'Sin cupos' }),
    )
    expect(() => assertHasCapacity(parking, 'MOTO')).not.toThrow()
  })

  it('isDue compara contra la hora de vencimiento', () => {
    expect(isDue(reservation('ACTIVA'), new Date('2026-11-20T10:14:59.000Z'))).toBe(false)
    expect(isDue(reservation('ACTIVA'), new Date('2026-11-20T10:15:00.000Z'))).toBe(true)
  })
})
