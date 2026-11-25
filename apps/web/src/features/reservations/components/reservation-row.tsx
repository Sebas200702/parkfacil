import type { Reservation } from '@features/reservations/reservation-types'
import { cx } from '@shared/utils/cx'
import { CircleCheck, CircleX, Clock, type LucideIcon, Ticket } from 'lucide-react'

type StateLook = { label: string; icon: LucideIcon; ink: string }

// Cada estado tiene icono y palabra propios: no se distingue solo por el color.
const STATES: Record<Reservation['estado'], StateLook> = {
  ACTIVA: { label: 'Activa', icon: Ticket, ink: 'text-status-held-ink' },
  CUMPLIDA: { label: 'Cumplida', icon: CircleCheck, ink: 'text-status-free' },
  VENCIDA: { label: 'Vencida', icon: Clock, ink: 'text-asphalt-600' },
  CANCELADA: { label: 'Cancelada', icon: CircleX, ink: 'text-status-taken' },
}

const VEHICLE_LABEL = { CARRO: 'Carro', MOTO: 'Moto' } as const

const WHEN = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

type ReservationRowProps = {
  reservation: Reservation
  /** Nombre del parqueadero; si ya no existe se muestra su identificador. */
  parkingName?: string
}

/** Una reserva pasada en el historial: dónde, qué espacio, cuándo y cómo terminó. */
export const ReservationRow = ({ reservation, parkingName }: ReservationRowProps) => {
  const { label, icon: Icon, ink } = STATES[reservation.estado]

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1 border-concrete-200 border-b p-4">
      <span className="grid gap-0.5">
        <span className="text-heading">{parkingName ?? reservation.parqueaderoId}</span>
        <span className="text-caption text-asphalt-600">
          {VEHICLE_LABEL[reservation.tipo]} · espacio{' '}
          <span className="font-mono">{reservation.espacioId}</span>
        </span>
      </span>
      <span className={cx('inline-flex items-center gap-1.5 text-label', ink)}>
        <Icon aria-hidden="true" size={18} strokeWidth={2.25} />
        {label}
      </span>
      <time dateTime={reservation.creadaEn} className="col-span-2 text-caption text-asphalt-600">
        {WHEN.format(new Date(reservation.creadaEn))}
      </time>
    </li>
  )
}
