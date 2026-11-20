import { listParkings } from '@domains/parkings/parking-service'
import { getDb } from '@shared/config/app-context'
import { jsonOk } from '@shared/http/api-response'
import type { PublicEvent } from '@shared/http/http-types'
import { withErrorHandling } from '@shared/http/with-error-handling'

/** GET /parqueaderos — público: parqueaderos con cupos y tarifas para el mapa. */
export const handler = withErrorHandling<PublicEvent>(async () =>
  jsonOk(await listParkings(getDb())),
)
