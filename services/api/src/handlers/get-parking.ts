import { requireParking } from '@domains/parkings/parking-service'
import { getDb } from '@shared/config/app-context'
import { NotFoundError } from '@shared/errors/not-found-error'
import { jsonOk } from '@shared/http/api-response'
import type { PublicEvent } from '@shared/http/http-types'
import { withErrorHandling } from '@shared/http/with-error-handling'

/** GET /parqueaderos/{id} — público: detalle de un parqueadero. */
export const handler = withErrorHandling<PublicEvent>(async (event) => {
  const id = event.pathParameters?.id
  if (!id) throw new NotFoundError('Parqueadero')
  return jsonOk(await requireParking(getDb(), id))
})
