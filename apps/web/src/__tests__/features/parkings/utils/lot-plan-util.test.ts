import { PLAN_BAYS, planBays } from '@features/parkings/utils/lot-plan-util'
import { describe, expect, it } from 'vitest'

const count = (bays: ReturnType<typeof planBays>, state: 'free' | 'taken' | 'held') =>
  bays.filter((bay) => bay.state === state).length

describe('planBays', () => {
  it('con pocos espacios dibuja una bahía por espacio', () => {
    const bays = planBays(3, 8, 'car')

    expect(bays).toHaveLength(8)
    expect(count(bays, 'free')).toBe(3)
    expect(count(bays, 'taken')).toBe(5)
  })

  it('con muchos espacios usa doce bahías y guarda la proporción', () => {
    const bays = planBays(20, 40, 'car')

    expect(bays).toHaveLength(PLAN_BAYS)
    expect(count(bays, 'free')).toBe(6)
  })

  it('en un parqueadero grande deja al menos una bahía libre si queda un cupo', () => {
    expect(count(planBays(1, 200, 'car'), 'free')).toBe(1)
  })

  it('lleno no deja bahías libres y vacío no dibuja vehículos', () => {
    expect(count(planBays(0, 10, 'car'), 'free')).toBe(0)
    expect(count(planBays(10, 10, 'car'), 'taken')).toBe(0)
  })

  it('marca cada bahía con el tipo de vehículo pedido', () => {
    expect(planBays(1, 4, 'moto').every((bay) => bay.vehicle === 'moto')).toBe(true)
  })

  it('al ocuparse un cupo más solo cambia una bahía', () => {
    const before = planBays(5, 12, 'car')
    const after = planBays(4, 12, 'car')

    const changed = before.filter((bay, index) => bay.state !== after[index]?.state)

    expect(changed).toHaveLength(1)
  })

  it('no reparte los vehículos todos a un mismo lado', () => {
    const taken = planBays(6, 12, 'car')
      .map((bay, index) => (bay.state === 'taken' ? index : -1))
      .filter((index) => index >= 0)

    expect(taken.some((index) => index < 6)).toBe(true)
    expect(taken.some((index) => index >= 6)).toBe(true)
  })

  it('con una reserva propia una de las bahías no libres lleva el tiquete', () => {
    const bays = planBays(4, 12, 'car', true)

    expect(count(bays, 'held')).toBe(1)
    expect(count(bays, 'taken')).toBe(7)
    expect(count(bays, 'free')).toBe(4)
  })

  it('muestra el tiquete aunque los conteos aún no descuenten la reserva', () => {
    const bays = planBays(4, 4, 'moto', true)

    expect(count(bays, 'held')).toBe(1)
    expect(count(bays, 'free')).toBe(3)
  })

  it('tolera datos inconsistentes', () => {
    expect(planBays(5, 0, 'car')).toEqual([])
    expect(count(planBays(9, 4, 'car'), 'free')).toBe(4)
    expect(count(planBays(-2, 4, 'car'), 'free')).toBe(0)
  })
})
