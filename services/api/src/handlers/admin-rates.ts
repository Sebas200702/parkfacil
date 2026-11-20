import { rateUpdateSchema } from '@domains/parkings/parking-schema'
import { updateRate } from '@domains/parkings/parking-service'
import { requireAdmin } from '@shared/auth/identity-util'
import { getDb } from '@shared/config/app-context'
import { jsonOk } from '@shared/http/api-response'
import type { AuthEvent } from '@shared/http/http-types'
import { readJsonBody } from '@shared/http/request-body-util'
import { withErrorHandling } from '@shared/http/with-error-handling'

/**
 * PUT /admin/tarifas — admin: configura la tarifa de un tipo de vehículo en SU parqueadero.
 * Un `parqueaderoId` en el cuerpo se ignora: el parqueadero sale del token.
 */
export const handler = withErrorHandling<AuthEvent>(async (event) => {
  const admin = requireAdmin(event)
  const { tipo, ...rate } = rateUpdateSchema.parse(readJsonBody(event))
  return jsonOk(await updateRate(getDb(), admin.parqueaderoId, tipo, rate))
})
