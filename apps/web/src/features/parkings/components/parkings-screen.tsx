import { useParkings } from '@features/parkings/hooks/use-parkings'
import { VEHICLE_OPTIONS } from '@features/parkings/parking-consts'
import type { VehicleType } from '@features/parkings/parking-types'
import { type ParkingRow, toParkingRows } from '@features/parkings/utils/parking-util'
import { useGeolocation } from '@shared/hooks/use-geolocation'
import { Button } from '@shared/ui/button'
import { EmptyState } from '@shared/ui/empty-state'
import { Segmented } from '@shared/ui/segmented'
import { LocateFixed } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LocationPrompt } from './location-prompt'
import { LotRow } from './lot-row'
import { ParkingDetail } from './parking-detail'
import { ParkingMap } from './parking-map'

type ParkingResultsProps = {
  status: 'loading' | 'ready' | 'error'
  rows: ParkingRow[]
  vehicle: VehicleType
  geolocation: ReturnType<typeof useGeolocation>
  onOpen: (id: string) => void
  onRetry: () => void
}

const ParkingResults = ({
  status,
  rows,
  vehicle,
  geolocation,
  onOpen,
  onRetry,
}: ParkingResultsProps) => {
  if (status === 'loading') {
    return <output className="block p-4 text-asphalt-600">Buscando parqueaderos…</output>
  }

  if (status === 'error') {
    return (
      <EmptyState
        illustration="offline"
        title="No pudimos conectar"
        action={
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        }
      >
        Revisa tu señal e intenta de nuevo.
      </EmptyState>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState illustration="no-results" title="Aún no hay parqueaderos">
        Cuando se registre uno lo verás aquí y en el mapa.
      </EmptyState>
    )
  }

  return (
    <>
      <ul>
        {rows.map(({ parking, meters }) => (
          <li key={parking.id}>
            <LotRow parking={parking} vehicle={vehicle} meters={meters} onOpen={onOpen} />
          </li>
        ))}
      </ul>
      <LocationPrompt status={geolocation.status} onLocate={geolocation.locate} />
    </>
  )
}

/**
 * Pantalla principal del conductor: mapa con las placas P y, al lado, la lista de parqueaderos.
 * Elegir una placa o una fila cambia la lista por el detalle de ese parqueadero.
 */
export const ParkingsScreen = () => {
  const { status, parkings, reload } = useParkings()
  const geolocation = useGeolocation()
  const [vehicle, setVehicle] = useState<VehicleType>('CARRO')
  const [openId, setOpenId] = useState<string | null>(null)

  const rows = useMemo(
    () => toParkingRows(parkings, geolocation.position),
    [parkings, geolocation.position],
  )

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col lg:flex-row-reverse">
      <div className="relative min-h-0 flex-1">
        <ParkingMap
          parkings={parkings}
          vehicle={vehicle}
          selectedId={openId}
          onSelect={setOpenId}
          userPosition={geolocation.position}
        />
        <Button
          variant="secondary"
          icon={LocateFixed}
          iconOnly
          aria-label="Mi ubicación"
          onClick={geolocation.locate}
          className="absolute right-3 bottom-6 z-10 shadow-marker lg:bottom-3"
        />
      </div>

      <section
        aria-labelledby={openId ? 'parking-title' : 'parkings-title'}
        className="relative z-10 -mt-3 flex max-h-[55%] flex-col rounded-t-card bg-paper shadow-sheet lg:mt-0 lg:max-h-none lg:w-[26rem] lg:rounded-none"
      >
        {openId ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ParkingDetail
              key={openId}
              id={openId}
              initial={parkings.find((parking) => parking.id === openId) ?? null}
              vehicle={vehicle}
              onVehicleChange={setVehicle}
              origin={geolocation.position}
              onBack={() => setOpenId(null)}
            />
          </div>
        ) : (
          <>
            <header className="grid gap-3 border-concrete-200 border-b p-4">
              <h1 id="parkings-title" className="text-title">
                Parqueaderos
              </h1>
              <Segmented
                label="Tipo de vehículo"
                options={VEHICLE_OPTIONS}
                value={vehicle}
                onChange={setVehicle}
              />
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ParkingResults
                status={status}
                rows={rows}
                vehicle={vehicle}
                geolocation={geolocation}
                onOpen={setOpenId}
                onRetry={reload}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
