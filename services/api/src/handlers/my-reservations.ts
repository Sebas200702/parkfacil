import { listMyReservations } from '@domains/reservations/reservation-service'
import { requireUser } from '@shared/auth/identity-util'
import { getDb } from '@shared/config/app-context'
import { jsonOk } from '@shared/http/api-response'
import type { AuthEvent } from '@shared/http/http-types'
import { withErrorHandling } from '@shared/http/with-error-handling'

/** GET /reservas/mias — conductor: sus reservas, de la más reciente a la más antigua. */
export const handler = withErrorHandling<AuthEvent>(async (event) => {
  const user = requireUser(event)
  return jsonOk(await listMyReservations(getDb(), user.sub))
})
