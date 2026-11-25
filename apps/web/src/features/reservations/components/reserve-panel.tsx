import { VEHICLE_PLURAL } from '@features/parkings/parking-consts'
import type { Parking, VehicleType } from '@features/parkings/parking-types'
import type {
  ReservationController,
  ReservationNotice,
} from '@features/reservations/hooks/use-reservation'
import { Button } from '@shared/ui/button'
import { ButtonLink } from '@shared/ui/button-link'
import { Notice, type NoticeTone } from '@shared/ui/notice'
import { LogIn, Ticket } from 'lucide-react'
import { ReservationTicket } from './reservation-ticket'

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
}

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

  if (reservation?.parqueaderoId === parking.id) {
    return <ReservationTicket reservation={reservation} />
  }

  if (reservation) {
    return (
      <div className="grid gap-3">
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
      </div>
    )
  }

  const copy = notice?.parkingId === parking.id ? NOTICES[notice.kind] : null

  return (
    <div className="grid gap-3">
      {copy ? (
        <Notice tone={copy.tone} title={copy.title}>
          {copy.body}
        </Notice>
      ) : null}
      <ReserveAction parking={parking} vehicle={vehicle} controller={controller} />
    </div>
  )
}
