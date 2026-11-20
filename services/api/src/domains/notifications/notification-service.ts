import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { optionalEnv } from '@shared/config/app-context'
import type { ReservationEmail } from './notification-types'

let client: SESv2Client | undefined

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', timeStyle: 'short' })

/**
 * Envía el correo de confirmación de la reserva con SES. Es best-effort: si SES no está
 * configurado (`SES_FROM` vacío) o falla, la reserva sigue siendo válida. Devuelve si se envió.
 */
export const sendReservationConfirmation = async (mail: ReservationEmail): Promise<boolean> => {
  const from = optionalEnv('SES_FROM')
  if (!from) return false
  client ??= new SESv2Client({})
  const text = [
    `Tu reserva en ${mail.parkingName} está confirmada.`,
    `Espacio: ${mail.espacioId}.`,
    `Tienes hasta las ${formatTime(mail.venceEn)} para llegar; después el cupo se libera.`,
  ].join('\n')
  try {
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: { ToAddresses: [mail.to] },
        Content: {
          Simple: {
            Subject: { Data: `ParkFácil: reserva en ${mail.parkingName}` },
            Body: { Text: { Data: text } },
          },
        },
      }),
    )
    return true
  } catch (err) {
    console.warn('No se pudo enviar el correo de confirmación', err)
    return false
  }
}
