import { expireAllDue } from '@domains/reservations/reservation-service'
import { getDb } from '@shared/config/app-context'

/** Barrido cada minuto: vence las reservas activas cuya hora ya pasó (red de seguridad del Scheduler). */
export const handler = async () => {
  const vencidas = await expireAllDue(getDb())
  if (vencidas > 0) console.info('Reservas vencidas por barrido', { vencidas })
  return { vencidas }
}
