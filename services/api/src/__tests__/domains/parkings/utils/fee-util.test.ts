import { calculateFee } from '@domains/parkings/utils/fee-util'
import { describe, expect, it } from 'vitest'

const rate = { valorHora: 4000, valorFraccion: 1000, valorDia: 30000 }

describe('calculateFee', () => {
  it.each([
    [0, 0],
    [-5, 0],
    [1, 1000],
    [10, 1000],
    [15, 1000],
    [16, 2000],
    [60, 4000],
    [61, 5000],
    [75, 5000],
    [90, 6000],
  ])('%i minutos cobra %i', (minutes, expected) => {
    expect(calculateFee(minutes, rate)).toBe(expected)
  })

  it('aplica el tope diario dentro de las primeras 24 h', () => {
    expect(calculateFee(23 * 60, rate)).toBe(30000)
  })

  it('cobra un día completo más el resto después de 24 h', () => {
    expect(calculateFee(25 * 60, rate)).toBe(34000)
  })

  it('redondea segundos hacia arriba al minuto', () => {
    expect(calculateFee(15.2, rate)).toBe(2000)
  })
})
