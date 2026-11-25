import { useCountdown } from '@features/reservations/hooks/use-countdown'
import { HURRY_SECONDS } from '@features/reservations/reservation-consts'
import type { Reservation } from '@features/reservations/reservation-types'
import {
  formatClock,
  percentLeft,
  spokenTimeLeft,
} from '@features/reservations/utils/countdown-util'
import { cx } from '@shared/utils/cx'
import { Ticket } from 'lucide-react'

const VEHICLE_LABEL = { CARRO: 'carro', MOTO: 'moto' } as const

const TIME = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', hour12: true })

// Muescas del troquel: dos medios círculos del color del fondo sobre la línea punteada.
const NOTCH = 'absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-paper'

type ReservationTicketProps = {
  reservation: Reservation
}

/** La reserva como tiquete de parqueadero: espacio apartado y cuenta regresiva de 15 minutos. */
export const ReservationTicket = ({ reservation }: ReservationTicketProps) => {
  const seconds = useCountdown(reservation.venceEn)
  const hurry = seconds <= HURRY_SECONDS
  const spoken = spokenTimeLeft(seconds)

  return (
    <section
      aria-labelledby="ticket-title"
      className="overflow-hidden rounded-card bg-asphalt-950 text-paper"
    >
      <div className="grid gap-3 p-4">
        <h2
          id="ticket-title"
          className="flex items-center gap-2 font-mono text-label text-status-held uppercase"
        >
          <Ticket aria-hidden="true" size={18} strokeWidth={2.25} />
          Tu reserva · {VEHICLE_LABEL[reservation.tipo]}
        </h2>

        <div className="flex items-end justify-between gap-3">
          {/* El reloj cambia cada segundo: se anuncia aparte, por minuto. */}
          <span
            role="timer"
            aria-label={spoken}
            className={cx(
              'font-mono text-count tabular-nums',
              hurry ? 'text-status-held' : 'text-paper',
            )}
          >
            {formatClock(seconds)}
          </span>
          <span className="pb-1.5 text-right text-caption text-concrete-300">
            {hurry ? 'Queda poco' : 'para llegar'}
          </span>
        </div>

        <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-asphalt-800">
          <span
            className="block h-full rounded-full bg-status-held transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
            style={{ width: `${percentLeft(seconds)}%` }}
          />
        </span>
      </div>

      <div className="relative">
        <hr className="border-asphalt-600 border-t-2 border-dashed" />
        <span aria-hidden="true" className={cx(NOTCH, '-left-2.5')} />
        <span aria-hidden="true" className={cx(NOTCH, '-right-2.5')} />
      </div>

      <dl className="grid grid-cols-2 gap-3 p-4">
        <div className="grid gap-0.5">
          <dt className="text-caption text-concrete-300">Tu espacio</dt>
          <dd className="font-mono text-figure">{reservation.espacioId}</dd>
        </div>
        <div className="grid gap-0.5 text-right">
          <dt className="text-caption text-concrete-300">Vence a las</dt>
          <dd className="font-mono text-figure">{TIME.format(new Date(reservation.venceEn))}</dd>
        </div>
      </dl>

      <span aria-live="polite" className="sr-only">
        {spoken}
      </span>
    </section>
  )
}
