import type { Metrics } from '@domains/metrics/metrics-types'
import { VEHICLE_TYPES } from '@domains/parkings/parking-consts'
import type { Parking } from '@domains/parkings/parking-types'
import type { OccupancyEvent } from '@domains/sensors/sensor-types'

/** Colombia no tiene horario de verano: UTC-5 fijo. */
const COLOMBIA_OFFSET_HOURS = -5

const pct = (part: number, total: number) =>
  total > 0 ? Math.round((part / total) * 1000) / 10 : 0

/** Hora local de Colombia (0-23) de una fecha ISO. */
export const colombiaHour = (iso: string) =>
  (new Date(iso).getUTCHours() + COLOMBIA_OFFSET_HOURS + 24) % 24

/** Ocupación actual del parqueadero más resumen de eventos: entradas por hora, hora pico e ingresos. */
export const computeMetrics = (parking: Parking, events: OccupancyEvent[]): Metrics => {
  const porTipo = {} as Metrics['porTipo']
  let capacidad = 0
  let libres = 0
  for (const tipo of VEHICLE_TYPES) {
    const cap = parking.capacidad[tipo] ?? 0
    const free = parking.cupos[tipo] ?? 0
    capacidad += cap
    libres += free
    porTipo[tipo] = { capacidad: cap, libres: free, ocupacionPct: pct(cap - free, cap) }
  }

  const entradasPorHora = Array.from({ length: 24 }, () => 0)
  const exits = events.filter((e) => e.tipo === 'SALIDA')
  for (const e of events) {
    if (e.tipo !== 'ENTRADA') continue
    const hour = colombiaHour(e.ocurridoEn)
    entradasPorHora[hour] = (entradasPorHora[hour] ?? 0) + 1
  }
  const max = Math.max(...entradasPorHora)
  return {
    capacidad,
    ocupados: capacidad - libres,
    ocupacionPct: pct(capacidad - libres, capacidad),
    porTipo,
    entradasPorHora,
    horaPico: max > 0 ? entradasPorHora.indexOf(max) : null,
    ingresosEstimados: exits.reduce((sum, e) => sum + (e.monto ?? 0), 0),
    salidas: exits.length,
  }
}
