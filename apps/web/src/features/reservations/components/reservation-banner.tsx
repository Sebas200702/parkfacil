import { useCountdown } from '@features/reservations/hooks/use-countdown'
import type { Reservation } from '@features/reservations/reservation-types'
import { formatClock, spokenTimeLeft } from '@features/reservations/utils/countdown-util'
import { ChevronRight, Ticket } from 'lucide-react'

type ReservationBannerProps = {
  reservation: Reservation
  parkingName?: string
  onOpen: (parkingId: string) => void
}

/** Recordatorio de la reserva activa sobre la lista: lleva al parqueadero donde está el tiquete. */
export const ReservationBanner = ({ reservation, parkingName, onOpen }: ReservationBannerProps) => {
  const seconds = useCountdown(reservation.venceEn)

  return (
    <button
      type="button"
      onClick={() => onOpen(reservation.parqueaderoId)}
      aria-label={`Ver tu reserva${parkingName ? ` en ${parkingName}` : ''}. ${spokenTimeLeft(seconds)}`}
      className="flex min-h-14 w-full cursor-pointer items-center gap-3 bg-asphalt-950 px-4 py-2 text-left text-paper focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus"
    >
      <Ticket aria-hidden="true" size={20} className="shrink-0 text-status-held" />
      <span className="grid min-w-0 flex-1">
        <span className="font-bold leading-5">Tu reserva</span>
        <span className="truncate text-caption text-concrete-300">
          {parkingName ? `${parkingName} · ` : ''}
          {reservation.espacioId}
        </span>
      </span>
      <span aria-hidden="true" className="font-mono text-figure tabular-nums">
        {formatClock(seconds)}
      </span>
      <ChevronRight aria-hidden="true" size={20} className="shrink-0 text-concrete-300" />
    </button>
  )
}
