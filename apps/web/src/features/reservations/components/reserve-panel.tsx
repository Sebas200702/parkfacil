import { VEHICLE_PLURAL } from '@features/parkings/parking-consts'
import type { Parking, VehicleType } from '@features/parkings/parking-types'
import type { ReservationController } from '@features/reservations/hooks/use-reservation'
import { useFocusWhenDone } from '@shared/hooks/use-focus-when-done'
import { Button } from '@shared/ui/button'
import { ButtonLink } from '@shared/ui/button-link'
import { Notice } from '@shared/ui/notice'
import { LogIn, Ticket } from 'lucide-react'
import { CancelReservation } from './cancel-reservation'
import { ReservationNoticeBox } from './reservation-notice'
import { ReservationTicket } from './reservation-ticket'

type ReservePanelProps = {
  parking: Parking
  vehicle: VehicleType
  controller: ReservationController
  /** Nombre del parqueadero donde está la reserva activa, cuando es otro. */
  reservedParkingName?: string
  onOpenParking: (id: string) => void
}

type ReserveActionProps = Pick<ReservePanelProps, 'parking' | 'vehicle' | 'controller'>

const ReserveAction = ({ parking, vehicle, controller }: ReserveActionProps) => {
  if (controller.notice?.kind === 'session') {
    return (
      <ButtonLink href="/login" icon={LogIn} block>
        Iniciar sesión
      </ButtonLink>
    )
  }

  if (parking.cupos[vehicle] <= 0) {
    return (
      <p className="text-asphalt-600">
        No quedan cupos para {VEHICLE_PLURAL[vehicle]}. Vuelve a mirar en unos minutos.
      </p>
    )
  }

  return (
    <>
      <Button
        icon={Ticket}
        block
        loading={controller.reserving}
        loadingLabel="Reservando"
        onClick={() => void controller.reserve(parking.id, vehicle)}
      >
        Reservar cupo
      </Button>
      <p className="text-caption text-asphalt-600">
        Te guardamos el cupo 15 minutos mientras llegas.
      </p>
    </>
  )
}

/** Zona de reserva del detalle: el botón, el tiquete con su contador o el aviso de lo que pasó. */
export const ReservePanel = ({
  parking,
  vehicle,
  controller,
  reservedParkingName,
  onOpenParking,
}: ReservePanelProps) => {
  const { reservation, notice } = controller
  // Al reservar o cancelar, el botón pulsado desaparece: el foco pasa a esta zona,
  // donde ahora está el tiquete o el aviso de lo que pasó.
  const panelRef = useFocusWhenDone<HTMLDivElement>(controller.reserving || controller.cancelling)

  const content = () => {
    if (reservation?.parqueaderoId === parking.id) {
      return (
        <>
          <ReservationTicket reservation={reservation} />
          <CancelReservation
            cancel={controller.cancel}
            cancelling={controller.cancelling}
            cancelProblem={controller.cancelProblem}
          />
        </>
      )
    }

    if (reservation) {
      return (
        <>
          <Notice tone="warn" title="Ya tienes una reserva activa">
            {reservedParkingName ? `Está en ${reservedParkingName}. ` : ''}
            Solo puedes tener una a la vez.
          </Notice>
          <Button
            variant="secondary"
            icon={Ticket}
            block
            onClick={() => onOpenParking(reservation.parqueaderoId)}
          >
            Ver mi reserva
          </Button>
        </>
      )
    }

    return (
      <>
        {notice?.parkingId === parking.id ? <ReservationNoticeBox kind={notice.kind} /> : null}
        <ReserveAction parking={parking} vehicle={vehicle} controller={controller} />
      </>
    )
  }

  return (
    <section ref={panelRef} tabIndex={-1} aria-label="Reserva" className="grid gap-3 outline-none">
      {content()}
    </section>
  )
}
