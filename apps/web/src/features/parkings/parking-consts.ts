import type { SegmentedOption } from '@shared/ui/segmented'
import { Car, Motorbike } from 'lucide-react'
import type { VehicleType } from './parking-types'

export const VEHICLE_OPTIONS: ReadonlyArray<SegmentedOption<VehicleType>> = [
  { value: 'CARRO', label: 'Carro', icon: Car },
  { value: 'MOTO', label: 'Moto', icon: Motorbike },
]

/** Plural en minúscula para frases: "No recibe motos." */
export const VEHICLE_PLURAL: Record<VehicleType, string> = {
  CARRO: 'carros',
  MOTO: 'motos',
}

/** Cada cuánto se vuelven a pedir los cupos mientras la pestaña está visible. */
export const PARKINGS_REFRESH_MS = 20_000
