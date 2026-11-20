import { findSpace, requireParking } from '@domains/parkings/parking-service'
import type { Space } from '@domains/parkings/parking-types'
import { calculateFee } from '@domains/parkings/utils/fee-util'
import type { Db } from '@shared/db/db-types'
import { ErrorCodes } from '@shared/errors/codes'
import { ConflictError } from '@shared/errors/conflict-error'
import { NotFoundError } from '@shared/errors/not-found-error'
import * as repo from './sensor-repository'
import type { OccupancyEvent, ReadingResult, SensorReading, SpaceTransition } from './sensor-types'
import { transitionForReading } from './utils/space-transition-util'

const MAX_ATTEMPTS = 3

const buildEvent = async (
  db: Db,
  reading: SensorReading,
  space: Space,
  t: SpaceTransition,
): Promise<OccupancyEvent | null> => {
  if (!t.event) return null
  const base = {
    parqueaderoId: reading.parqueaderoId,
    espacioId: space.id,
    tipo: t.event,
    tipoVehiculo: space.tipo,
    ocurridoEn: reading.ocurridoEn.toISOString(),
  }
  if (t.event === 'ENTRADA') return base
  const rate = (await requireParking(db, reading.parqueaderoId)).tarifas[space.tipo]
  const minutes = (reading.ocurridoEn.getTime() - new Date(space.actualizadoEn).getTime()) / 60_000
  return { ...base, monto: rate ? calculateFee(minutes, rate) : 0 }
}

/**
 * Aplica la lectura de un sensor: cambia el estado del espacio, ajusta cupos, cumple la reserva
 * si el carro llegó y registra el evento (con el cobro en las salidas). Si otro evento cambió el
 * espacio a la vez, vuelve a leer y reintenta.
 */
export const processReading = async (db: Db, reading: SensorReading): Promise<ReadingResult> => {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const space = await findSpace(db, reading.parqueaderoId, reading.espacioId)
    if (!space) throw new NotFoundError('Espacio')
    const transition = transitionForReading(space.estado, reading.estado)
    if (!transition.changes) return { cambio: false, estado: space.estado }

    const applied = await repo.applyTransition(db, {
      reading,
      previous: space.estado,
      tipo: space.tipo,
      transition,
      reservaId: space.reservaId,
      event: await buildEvent(db, reading, space, transition),
    })
    if (applied) return { cambio: true, estado: transition.next }
  }
  throw new ConflictError(
    ErrorCodes.CONCURRENT_UPDATE,
    'No se pudo aplicar la lectura por cambios simultáneos',
  )
}

/** Eventos de ocupación de un parqueadero entre dos fechas. */
export const listEvents = (db: Db, parkingId: string, from: Date, to: Date) =>
  repo.listEvents(db, parkingId, from, to)
