export const ErrorCodes = {
  VALIDATION: 'VALIDATION',
  INVALID_JSON: 'INVALID_JSON',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  NO_CAPACITY: 'NO_CAPACITY',
  ACTIVE_RESERVATION: 'ACTIVE_RESERVATION',
  RESERVATION_NOT_ACTIVE: 'RESERVATION_NOT_ACTIVE',
  CONCURRENT_UPDATE: 'CONCURRENT_UPDATE',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL: 'INTERNAL',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes] | (string & {})

export interface ApiError {
  code: ErrorCode
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  data: T | null
  status: number
  error: ApiError | null
}

export type VehicleType = 'CARRO' | 'MOTO'

export type SpaceState = 'LIBRE' | 'OCUPADO' | 'RESERVADO'

export type ReservationState = 'ACTIVA' | 'CUMPLIDA' | 'VENCIDA' | 'CANCELADA'

export interface Tarifa {
  valorHora: number
  valorFraccion: number
  valorDia: number
}

export type Tarifas = Partial<Record<VehicleType, Tarifa>>

export interface Parqueadero {
  id: string
  nombre: string
  direccion: string
  lat: number
  lng: number
  capacidad: Record<VehicleType, number>
  cupos: Record<VehicleType, number>
  tarifas: Tarifas
}

export interface Espacio {
  parqueaderoId: string
  id: string
  tipo: VehicleType
  estado: SpaceState
  reservaId?: string
  actualizadoEn: string
}

export interface OcupacionTipo {
  capacidad: number
  libres: number
  ocupacionPct: number
}

export interface MetricasAdmin {
  capacidad: number
  ocupados: number
  ocupacionPct: number
  porTipo: Record<VehicleType, OcupacionTipo>
  entradasPorHora: number[]
  horaPico: number | null
  ingresosEstimados: number
  salidas: number
}

export interface Reserva {
  id: string
  parqueaderoId: string
  espacioId: string
  usuarioId: string
  tipo: VehicleType
  estado: ReservationState
  creadaEn: string
  venceEn: string
  finalizadaEn?: string
}
