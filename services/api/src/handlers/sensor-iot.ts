import { sensorReadingSchema } from '@domains/sensors/sensor-schema'
import { processReading } from '@domains/sensors/sensor-service'
import { getDb } from '@shared/config/app-context'
import { AppError } from '@shared/errors/app-error'
import { ZodError } from 'zod'

/**
 * Regla de IoT Core: `SELECT *, topic(2) AS parqueaderoId, topic(4) AS espacioId
 * FROM 'parkfacil/+/espacios/+'`. Los mensajes inválidos o de espacios inexistentes se
 * descartan (con log) para que Lambda no los reintente; los errores de infraestructura sí relanzan.
 */
export const handler = async (event: unknown) => {
  try {
    const { ts, ...reading } = sensorReadingSchema.parse(event)
    return await processReading(getDb(), { ...reading, ocurridoEn: ts })
  } catch (err) {
    if (err instanceof ZodError || (err instanceof AppError && err.status < 500)) {
      console.warn('Lectura de sensor descartada', { event, err: String(err) })
      return { cambio: false, descartada: true }
    }
    throw err
  }
}
