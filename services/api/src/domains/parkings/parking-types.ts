import type { VEHICLE_TYPES } from './parking-consts'

export type VehicleType = (typeof VEHICLE_TYPES)[number]
export type SpaceState = 'LIBRE' | 'OCUPADO' | 'RESERVADO'
export type PerType = Record<VehicleType, number>

export interface Rate {
  valorHora: number
  valorFraccion: number
  valorDia: number
}

export type Rates = Partial<Record<VehicleType, Rate>>

export interface Parking {
  id: string
  nombre: string
  direccion: string
  lat: number
  lng: number
  capacidad: PerType
  cupos: PerType
  tarifas: Rates
}

export interface Space {
  parqueaderoId: string
  id: string
  tipo: VehicleType
  estado: SpaceState
  reservaId?: string
  actualizadoEn: string
}
