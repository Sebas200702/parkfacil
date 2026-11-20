import { expiryTargetSchema } from '@domains/reservations/reservation-schema'
import { expireIfDue } from '@domains/reservations/reservation-service'
import { getDb } from '@shared/config/app-context'

/** Destino de EventBridge Scheduler: vence la reserva si sigue activa. Idempotente. */
export const handler = async (event: unknown) => {
  const target = expiryTargetSchema.parse(event)
  const vencida = await expireIfDue(getDb(), target)
  console.info('Vencimiento programado procesado', { ...target, vencida })
  return { vencida }
}
