import { useParkings } from '@features/parkings/hooks/use-parkings'
import { useMyReservations } from '@features/reservations/hooks/use-my-reservations'
import { useReservation } from '@features/reservations/hooks/use-reservation'
import { Button } from '@shared/ui/button'
import { ButtonLink } from '@shared/ui/button-link'
import { EmptyState } from '@shared/ui/empty-state'
import { ArrowLeft, MapPin, Search } from 'lucide-react'
import Link from 'next/link'
import { CancelReservation } from './cancel-reservation'
import { ReservationNoticeBox } from './reservation-notice'
import { ReservationRow } from './reservation-row'
import { ReservationTicket } from './reservation-ticket'

/**
 * Mis reservas: la reserva activa con su contador y la opción de cancelarla,
 * y debajo el historial, de la más reciente a la más antigua.
 */
export const MyReservationsScreen = () => {
  const controller = useReservation()
  const { reservation: active, notice } = controller
  // Cancelar, vencer o cumplir la activa cambia el historial: se vuelve a pedir en ese momento.
  const { status, reservations, reload } = useMyReservations(
    `${active?.id ?? ''}:${notice?.kind ?? ''}`,
  )
  const { parkings } = useParkings()

  const nameOf = (parkingId: string) => parkings.find((parking) => parking.id === parkingId)?.nombre
  const history = reservations.filter((reservation) => reservation.id !== active?.id)
  const isEmpty = status === 'ready' && !active && history.length === 0

  return (
    <div className="mx-auto grid w-full max-w-[34rem] gap-5 p-4 pb-10">
      <Link
        href="/mapa"
        className="-ml-1 inline-flex min-h-12 items-center gap-2 justify-self-start rounded-plate px-1 font-bold text-brand-600 underline decoration-2 underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <ArrowLeft aria-hidden="true" size={20} />
        Parqueaderos
      </Link>

      <h1 className="text-title">Mis reservas</h1>

      {notice && !active ? <ReservationNoticeBox kind={notice.kind} /> : null}

      {active ? (
        <section aria-labelledby="active-title" className="grid gap-3">
          <h2 id="active-title" className="flex items-center gap-1.5 text-heading">
            <MapPin aria-hidden="true" size={20} strokeWidth={2.25} className="shrink-0" />
            {nameOf(active.parqueaderoId) ?? 'Reserva activa'}
          </h2>
          <ReservationTicket reservation={active} />
          <CancelReservation
            cancel={controller.cancel}
            cancelling={controller.cancelling}
            cancelProblem={controller.cancelProblem}
          />
        </section>
      ) : null}

      {status === 'loading' ? (
        <output className="block text-asphalt-600">Buscando tus reservas…</output>
      ) : null}

      {status === 'error' ? (
        <EmptyState
          illustration="offline"
          title="No pudimos conectar"
          action={
            <Button variant="secondary" onClick={reload}>
              Reintentar
            </Button>
          }
        >
          Revisa tu señal e intenta de nuevo.
        </EmptyState>
      ) : null}

      {isEmpty ? (
        <EmptyState
          illustration="no-reservations"
          title="Aún no tienes reservas"
          action={
            <ButtonLink href="/mapa" variant="primary" icon={Search}>
              Buscar parqueadero
            </ButtonLink>
          }
        >
          Cuando apartes un cupo lo verás aquí, con el tiempo que te queda para llegar.
        </EmptyState>
      ) : null}

      {history.length > 0 ? (
        <section aria-labelledby="history-title" className="grid gap-1">
          <h2 id="history-title" className="text-heading">
            Anteriores
          </h2>
          <ul className="border-concrete-200 border-t">
            {history.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                parkingName={nameOf(reservation.parqueaderoId)}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
