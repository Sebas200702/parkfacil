import { createReservationSchema } from '@domains/reservations/reservation-schema'
import { createReservation } from '@domains/reservations/reservation-service'
import { requireUser } from '@shared/auth/identity-util'
import { getDb } from '@shared/config/app-context'
import { jsonOk } from '@shared/http/api-response'
import type { AuthEvent } from '@shared/http/http-types'
import { readJsonBody } from '@shared/http/request-body-util'
import { withErrorHandling } from '@shared/http/with-error-handling'

/** POST /reservas — conductor: aparta un cupo por 15 minutos (409 "Sin cupos" si no hay). */
export const handler = withErrorHandling<AuthEvent>(async (event) => {
  const user = requireUser(event)
  const body = createReservationSchema.parse(readJsonBody(event))
  const reservation = await createReservation(getDb(), {
    ...body,
    usuarioId: user.sub,
    email: user.email,
  })
  return jsonOk(reservation, 201)
})
