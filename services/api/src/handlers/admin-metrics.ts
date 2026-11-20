import { getMetrics } from '@domains/metrics/metrics-service'
import { requireAdmin } from '@shared/auth/identity-util'
import { getDb } from '@shared/config/app-context'
import { jsonOk } from '@shared/http/api-response'
import type { AuthEvent } from '@shared/http/http-types'
import { withErrorHandling } from '@shared/http/with-error-handling'

/** GET /admin/metricas — admin: ocupación, ingresos estimados y horas pico de SU parqueadero. */
export const handler = withErrorHandling<AuthEvent>(async (event) => {
  const admin = requireAdmin(event)
  return jsonOk(await getMetrics(getDb(), admin.parqueaderoId))
})
