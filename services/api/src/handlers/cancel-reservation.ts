import { cancelReservation } from '@domains/reservations/reservation-service'
import { requireUser } from '@shared/auth/identity-util'
import { getDb } from '@shared/config/app-context'
import { NotFoundError } from '@shared/errors/not-found-error'
import { jsonOk } from '@shared/http/api-response'
import type { AuthEvent } from '@shared/http/http-types'
import { withErrorHandling } from '@shared/http/with-error-handling'

/** DELETE /reservas/{id} — conductor: cancela su reserva activa y libera el cupo. */
export const handler = withErrorHandling<AuthEvent>(async (event) => {
  const user = requireUser(event)
  const id = event.pathParameters?.id
  if (!id) throw new NotFoundError('Reserva')
  return jsonOk(await cancelReservation(getDb(), user.sub, id))
})
