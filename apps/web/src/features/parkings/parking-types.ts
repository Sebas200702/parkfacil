// Contrato de GET /parqueaderos (docs/api.md). Los campos van en español, como los publica la API.

export type VehicleType = 'CARRO' | 'MOTO'

export type PerType = Record<VehicleType, number>

export interface Rate {
  valorHora: number
  valorFraccion: number
  valorDia: number
}

export interface Parking {
  id: string
  nombre: string
  direccion: string
  lat: number
  lng: number
  capacidad: PerType
  cupos: PerType
  tarifas: Partial<Record<VehicleType, Rate>>
}

/** Forma de todas las respuestas de la API. */
export interface ApiEnvelope<T> {
  data: T
  status: number
  error: { code: string; message: string } | null
}
