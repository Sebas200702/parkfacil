import type { ReservationNotice } from '@features/reservations/hooks/use-reservation'
import { Notice, type NoticeTone } from '@shared/ui/notice'

type NoticeCopy = { tone: NoticeTone; title: string; body: string }

// Cada aviso dice qué pasó y qué hacer; nunca muestra el código del error.
const NOTICES: Record<ReservationNotice['kind'], NoticeCopy> = {
  'no-capacity': {
    tone: 'error',
    title: 'Sin cupos',
    body: 'Se llenó mientras reservabas. Mira otro parqueadero cerca.',
  },
  'active-reservation': {
    tone: 'warn',
    title: 'Ya tienes una reserva activa',
    body: 'Solo puedes tener una a la vez.',
  },
  session: {
    tone: 'error',
    title: 'Tu sesión venció',
    body: 'Vuelve a entrar para reservar.',
  },
  connection: {
    tone: 'error',
    title: 'No pudimos reservar',
    body: 'Revisa tu señal e intenta de nuevo.',
  },
  expired: {
    tone: 'warn',
    title: 'Tu reserva venció',
    body: 'Pasaron los 15 minutos y el cupo quedó libre. Puedes reservar otra vez.',
  },
  arrived: {
    tone: 'ok',
    title: 'Llegaste a tu cupo',
    body: 'Tu reserva quedó cumplida.',
  },
  cancelled: {
    tone: 'ok',
    title: 'Reserva cancelada',
    body: 'El cupo quedó libre para otra persona.',
  },
}

/** Aviso de lo último que pasó con una reserva. */
export const ReservationNoticeBox = ({ kind }: { kind: ReservationNotice['kind'] }) => {
  const { tone, title, body } = NOTICES[kind]

  return (
    <Notice tone={tone} title={title}>
      {body}
    </Notice>
  )
}
