import type { VehicleType } from '@domains/parkings/parking-types'

export interface TypeOccupancy {
  capacidad: number
  libres: number
  ocupacionPct: number
}

export interface Metrics {
  capacidad: number
  ocupados: number
  ocupacionPct: number
  porTipo: Record<VehicleType, TypeOccupancy>
  entradasPorHora: number[]
  horaPico: number | null
  ingresosEstimados: number
  salidas: number
}
