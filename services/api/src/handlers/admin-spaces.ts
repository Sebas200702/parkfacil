import { listSpaces } from '@domains/parkings/parking-service'
import { requireAdmin } from '@shared/auth/identity-util'
import { getDb } from '@shared/config/app-context'
import { jsonOk } from '@shared/http/api-response'
import type { AuthEvent } from '@shared/http/http-types'
import { withErrorHandling } from '@shared/http/with-error-handling'

/** GET /admin/espacios — admin: estado de los espacios de SU parqueadero (sale del token). */
export const handler = withErrorHandling<AuthEvent>(async (event) => {
  const admin = requireAdmin(event)
  return jsonOk(await listSpaces(getDb(), admin.parqueaderoId))
})
