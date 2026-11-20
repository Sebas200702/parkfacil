import { colombiaHour, computeMetrics } from '@domains/metrics/utils/metrics-util'
import type { Parking } from '@domains/parkings/parking-types'
import type { OccupancyEvent } from '@domains/sensors/sensor-types'
import { describe, expect, it } from 'vitest'

const parking: Parking = {
  id: 'p1',
  nombre: 'Centro',
  direccion: 'Calle 1',
  lat: 0,
  lng: 0,
  capacidad: { CARRO: 8, MOTO: 2 },
  cupos: { CARRO: 2, MOTO: 2 },
  tarifas: {},
}

const event = (tipo: OccupancyEvent['tipo'], iso: string, monto?: number): OccupancyEvent => ({
  parqueaderoId: 'p1',
  espacioId: 'e1',
  tipo,
  tipoVehiculo: 'CARRO',
  ocurridoEn: iso,
  ...(monto !== undefined ? { monto } : {}),
})

describe('colombiaHour', () => {
  it('convierte UTC a UTC-5', () => {
    expect(colombiaHour('2026-11-20T13:30:00.000Z')).toBe(8)
    expect(colombiaHour('2026-11-20T02:00:00.000Z')).toBe(21)
  })
})

describe('computeMetrics', () => {
  it('calcula ocupación total y por tipo', () => {
    const m = computeMetrics(parking, [])
    expect(m).toMatchObject({ capacidad: 10, ocupados: 6, ocupacionPct: 60, horaPico: null })
    expect(m.porTipo.CARRO).toEqual({ capacidad: 8, libres: 2, ocupacionPct: 75 })
    expect(m.porTipo.MOTO).toEqual({ capacidad: 2, libres: 2, ocupacionPct: 0 })
  })

  it('cuenta entradas por hora local, hora pico e ingresos de las salidas', () => {
    const m = computeMetrics(parking, [
      event('ENTRADA', '2026-11-20T13:05:00.000Z'),
      event('ENTRADA', '2026-11-20T13:40:00.000Z'),
      event('ENTRADA', '2026-11-20T17:00:00.000Z'),
      event('SALIDA', '2026-11-20T18:00:00.000Z', 5000),
      event('SALIDA', '2026-11-20T19:00:00.000Z', 2000),
    ])
    expect(m.entradasPorHora[8]).toBe(2)
    expect(m.entradasPorHora[12]).toBe(1)
    expect(m.horaPico).toBe(8)
    expect(m.ingresosEstimados).toBe(7000)
    expect(m.salidas).toBe(2)
  })
})
