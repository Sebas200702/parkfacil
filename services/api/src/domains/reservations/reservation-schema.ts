import { VEHICLE_TYPES } from '@domains/parkings/parking-consts'
import { z } from 'zod'

/** Cuerpo de `POST /reservas`. */
export const createReservationSchema = z.object({
  parqueaderoId: z.string().min(1, 'Requerido'),
  tipo: z.enum(VEHICLE_TYPES),
})

/** Entrada que EventBridge Scheduler envía a la Lambda de vencimiento. */
export const expiryTargetSchema = z.object({
  parqueaderoId: z.string().min(1),
  reservaId: z.string().min(1),
})
