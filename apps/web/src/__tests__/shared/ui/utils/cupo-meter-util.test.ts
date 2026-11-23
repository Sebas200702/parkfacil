import { freeBays, METER_BAYS } from '@shared/ui/utils/cupo-meter-util'
import { describe, expect, it } from 'vitest'

describe('freeBays', () => {
  it('reparte los cupos libres en proporción sobre las 12 bahías', () => {
    expect(freeBays(12, 40)).toBe(4)
    expect(freeBays(20, 40)).toBe(6)
  })

  it('dibuja todas las bahías libres cuando el parqueadero está vacío', () => {
    expect(freeBays(40, 40)).toBe(METER_BAYS)
  })

  it('muestra al menos una bahía libre si queda un cupo', () => {
    expect(freeBays(1, 200)).toBe(1)
  })

  it('no muestra bahías libres cuando está lleno', () => {
    expect(freeBays(0, 25)).toBe(0)
  })

  it('tolera datos inconsistentes sin salirse del rango', () => {
    expect(freeBays(50, 40)).toBe(METER_BAYS)
    expect(freeBays(-3, 40)).toBe(0)
    expect(freeBays(5, 0)).toBe(0)
  })
})
