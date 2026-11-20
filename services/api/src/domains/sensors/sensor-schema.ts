import { z } from 'zod'

const MAX_CLOCK_SKEW_MS = 5 * 60_000

/** `ts` en segundos epoch (como lo envía el sensor). Sin `ts` se usa la hora de llegada. */
const timestamp = z
  .number()
  .int()
  .positive()
  .optional()
  .transform((ts) => (ts ? new Date(ts * 1000) : new Date()))
  .refine((d) => d.getTime() <= Date.now() + MAX_CLOCK_SKEW_MS, 'La hora está en el futuro')

/** Mensaje del sensor. Tópico MQTT: `parkfacil/{parqueaderoId}/espacios/{espacioId}`. */
export const sensorReadingSchema = z.object({
  parqueaderoId: z.string().min(1),
  espacioId: z.string().min(1),
  estado: z.enum(['LIBRE', 'OCUPADO']),
  ts: timestamp,
})
