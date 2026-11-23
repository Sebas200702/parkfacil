import { sensorReadingSchema } from '@domains/sensors/sensor-schema'
import { describe, expect, it } from 'vitest'

describe('sensorReadingSchema', () => {
  it('convierte ts en segundos epoch a fecha', () => {
    const r = sensorReadingSchema.parse({
      parqueaderoId: 'p1',
      espacioId: 'e1',
      estado: 'OCUPADO',
      ts: 1764000000,
    })
    expect(r.ts.toISOString()).toBe('2025-11-24T16:00:00.000Z')
  })

  it('usa la hora actual si no hay ts', () => {
    const r = sensorReadingSchema.parse({ parqueaderoId: 'p1', espacioId: 'e1', estado: 'LIBRE' })
    expect(Math.abs(r.ts.getTime() - Date.now())).toBeLessThan(1000)
  })

  it('rechaza estados desconocidos y horas en el futuro', () => {
    const base = { parqueaderoId: 'p1', espacioId: 'e1' }
    expect(sensorReadingSchema.safeParse({ ...base, estado: 'RESERVADO' }).success).toBe(false)
    const future = Math.floor(Date.now() / 1000) + 3600
    expect(sensorReadingSchema.safeParse({ ...base, estado: 'LIBRE', ts: future }).success).toBe(
      false,
    )
  })
})
