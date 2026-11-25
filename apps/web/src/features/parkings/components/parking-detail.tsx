import { useParking } from '@features/parkings/hooks/use-parking'
import { VEHICLE_OPTIONS, VEHICLE_PLURAL } from '@features/parkings/parking-consts'
import type { Parking, VehicleType } from '@features/parkings/parking-types'
import { ReservePanel } from '@features/reservations/components/reserve-panel'
import type { ReservationController } from '@features/reservations/hooks/use-reservation'
import { Button } from '@shared/ui/button'
import { ButtonLink } from '@shared/ui/button-link'
import { EmptyState } from '@shared/ui/empty-state'
import { RateTable } from '@shared/ui/rate-table'
import { Segmented } from '@shared/ui/segmented'
import { distanceMeters, formatDistance, type GeoPoint } from '@shared/utils/geo-util'
import { ArrowLeft, MapPin, Navigation } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { LotPlan } from './lot-plan'

type ParkingDetailProps = {
  id: string
  /** Lo que la lista ya sabía de este parqueadero; se muestra mientras llega el dato fresco. */
  initial: Parking | null
  vehicle: VehicleType
  onVehicleChange: (vehicle: VehicleType) => void
  /** Ubicación de la persona, si la compartió. */
  origin: GeoPoint | null
  /** La reserva activa de la persona y la acción de reservar. */
  reservations: ReservationController
  /** Nombre del parqueadero donde está la reserva activa, cuando es otro. */
  reservedParkingName?: string
  onOpenParking: (id: string) => void
  onBack: () => void
}

const directionsUrl = ({ lat, lng }: Parking): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

const BackButton = ({ onBack }: { onBack: () => void }) => (
  <Button variant="quiet" icon={ArrowLeft} onClick={onBack} className="-ml-3 justify-self-start">
    Parqueaderos
  </Button>
)

type DetailBodyProps = Omit<ParkingDetailProps, 'id' | 'initial'> & { parking: Parking }

const DetailBody = ({
  parking,
  vehicle,
  onVehicleChange,
  origin,
  reservations,
  reservedParkingName,
  onOpenParking,
  onBack,
}: DetailBodyProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const capacity = parking.capacidad[vehicle]
  const { reservation } = reservations
  const reservedHere = reservation?.parqueaderoId === parking.id
  const rate = parking.tarifas[vehicle]
  const distance = origin ? ` · ${formatDistance(distanceMeters(origin, parking))}` : ''

  // Al abrir el detalle el foco pasa al título, para que teclado y lector de pantalla sigan aquí.
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <article aria-labelledby="parking-title" className="grid gap-5 p-4">
      <BackButton onBack={onBack} />

      <header className="grid gap-1">
        <h1 id="parking-title" ref={titleRef} tabIndex={-1} className="text-title outline-none">
          {parking.nombre}
        </h1>
        <p className="flex items-center gap-1 text-caption text-asphalt-600">
          <MapPin aria-hidden="true" size={16} strokeWidth={2.25} className="shrink-0" />
          {parking.direccion}
          {distance}
        </p>
      </header>

      <Segmented
        label="Tipo de vehículo"
        options={VEHICLE_OPTIONS}
        value={vehicle}
        onChange={onVehicleChange}
      />

      {capacity > 0 || reservedHere ? (
        <ReservePanel
          parking={parking}
          vehicle={vehicle}
          controller={reservations}
          reservedParkingName={reservedParkingName}
          onOpenParking={onOpenParking}
        />
      ) : null}

      {capacity > 0 ? (
        <>
          <section aria-labelledby="parking-spots" className="grid gap-3">
            <h2 id="parking-spots" className="text-heading">
              Cupos
            </h2>
            <LotPlan
              free={parking.cupos[vehicle]}
              capacity={capacity}
              vehicle={vehicle}
              held={reservedHere && reservation?.tipo === vehicle}
            />
          </section>

          <section aria-labelledby="parking-rates" className="grid gap-1">
            <h2 id="parking-rates" className="text-heading">
              Tarifas
            </h2>
            {rate ? (
              <>
                <RateTable rate={rate} />
                <p className="text-caption text-asphalt-600">
                  Toda estadía cobra al menos una fracción.
                </p>
              </>
            ) : (
              <p className="text-asphalt-600">
                Aún no publica tarifas para {VEHICLE_PLURAL[vehicle]}.
              </p>
            )}
          </section>
        </>
      ) : (
        <p className="text-asphalt-600">Este parqueadero no recibe {VEHICLE_PLURAL[vehicle]}.</p>
      )}

      <ButtonLink href={directionsUrl(parking)} icon={Navigation} external block>
        Cómo llegar
      </ButtonLink>
    </article>
  )
}

/** Detalle de un parqueadero: cupos y tarifas del tipo de vehículo elegido, y cómo llegar. */
export const ParkingDetail = ({ id, initial, onBack, ...rest }: ParkingDetailProps) => {
  // Reservar o perder la reserva cambia los cupos: se vuelven a pedir en ese momento.
  const { reservation, notice } = rest.reservations
  const revision = `${reservation?.id ?? ''}:${notice?.kind ?? ''}`
  const { status, parking, reload } = useParking(id, initial, revision)

  if (parking) return <DetailBody parking={parking} onBack={onBack} {...rest} />

  if (status === 'loading') {
    return <output className="block p-4 text-asphalt-600">Cargando parqueadero…</output>
  }

  if (status === 'not-found') {
    return (
      <EmptyState
        illustration="no-results"
        title="Este parqueadero ya no está"
        action={<Button onClick={onBack}>Ver parqueaderos</Button>}
      >
        Puede que lo hayan retirado. Mira los demás en el mapa.
      </EmptyState>
    )
  }

  return (
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
  )
}
