import { sensorReadingSchema } from '@domains/sensors/sensor-schema'
import { processReading } from '@domains/sensors/sensor-service'
import { isValidApiKey } from '@shared/auth/api-key-util'
import { getDb, optionalEnv } from '@shared/config/app-context'
import { AppError } from '@shared/errors/app-error'
import { ErrorCodes } from '@shared/errors/codes'
import { jsonOk } from '@shared/http/api-response'
import type { PublicEvent } from '@shared/http/http-types'
import { readJsonBody } from '@shared/http/request-body-util'
import { withErrorHandling } from '@shared/http/with-error-handling'

/**
 * POST /sensores/eventos — alternativa a IoT Core si el laboratorio lo bloquea.
 * Exige el header `x-api-key`; sin `SENSOR_API_KEY` configurada el endpoint queda deshabilitado.
 */
export const handler = withErrorHandling<PublicEvent>(async (event) => {
  const expected = optionalEnv('SENSOR_API_KEY')
  if (!expected) {
    throw new AppError({
      code: ErrorCodes.SERVICE_UNAVAILABLE,
      message: 'Endpoint de sensores deshabilitado',
      status: 503,
    })
  }
  if (!isValidApiKey(event.headers?.['x-api-key'], expected)) {
    throw new AppError({ code: ErrorCodes.UNAUTHORIZED, message: 'API key inválida', status: 401 })
  }
  const { ts, ...reading } = sensorReadingSchema.parse(readJsonBody(event))
  return jsonOk(await processReading(getDb(), { ...reading, ocurridoEn: ts }))
})
