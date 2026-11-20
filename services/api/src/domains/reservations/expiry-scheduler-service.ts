import { CreateScheduleCommand, SchedulerClient } from '@aws-sdk/client-scheduler'
import { optionalEnv } from '@shared/config/app-context'
import type { Reservation } from './reservation-types'

let client: SchedulerClient | undefined

/**
 * Programa en EventBridge Scheduler el vencimiento exacto de la reserva.
 * Es best-effort: si el Scheduler no está configurado o falla, el barrido por minuto
 * (`sweep-expired`) vence la reserva igual. Devuelve si quedó programada.
 */
export const scheduleExpiry = async (reservation: Reservation): Promise<boolean> => {
  const targetArn = optionalEnv('SCHEDULER_TARGET_ARN')
  const roleArn = optionalEnv('SCHEDULER_ROLE_ARN')
  if (!targetArn || !roleArn) return false
  client ??= new SchedulerClient({})
  try {
    await client.send(
      new CreateScheduleCommand({
        Name: `reserva-${reservation.id}`,
        GroupName: optionalEnv('SCHEDULER_GROUP') ?? 'default',
        ScheduleExpression: `at(${reservation.venceEn.slice(0, 19)})`,
        ScheduleExpressionTimezone: 'UTC',
        FlexibleTimeWindow: { Mode: 'OFF' },
        ActionAfterCompletion: 'DELETE',
        Target: {
          Arn: targetArn,
          RoleArn: roleArn,
          Input: JSON.stringify({
            parqueaderoId: reservation.parqueaderoId,
            reservaId: reservation.id,
          }),
        },
      }),
    )
    return true
  } catch (err) {
    console.warn('No se pudo programar el vencimiento; queda el barrido por minuto', err)
    return false
  }
}
