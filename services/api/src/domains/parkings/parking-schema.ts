import { z } from 'zod'
import { VEHICLE_TYPES } from './parking-consts'

const money = z
  .number()
  .int('Debe ser un valor entero en pesos')
  .nonnegative('No puede ser negativo')

/** Cuerpo de `PUT /admin/tarifas`. El parqueadero sale del token, no de aquí. */
export const rateUpdateSchema = z.object({
  tipo: z.enum(VEHICLE_TYPES),
  valorHora: money,
  valorFraccion: money,
  valorDia: money,
})
