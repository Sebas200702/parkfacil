import type { Db } from '@shared/db/db-types'
import { isConditionalFailure } from '@shared/db/db-util'
import { NotFoundError } from '@shared/errors/not-found-error'
import * as repo from './parking-repository'
import type { Parking, Rate, Space, VehicleType } from './parking-types'

/** Lista los parqueaderos con cupos y tarifas para el mapa del conductor. */
export const listParkings = (db: Db): Promise<Parking[]> => repo.listParkings(db)

/** Devuelve el parqueadero o lanza 404. */
export const requireParking = async (db: Db, id: string): Promise<Parking> => {
  const parking = await repo.getParking(db, id)
  if (!parking) throw new NotFoundError('Parqueadero')
  return parking
}

/** Devuelve el espacio o `null` si no existe. */
export const findSpace = (db: Db, parkingId: string, spaceId: string) =>
  repo.getSpace(db, parkingId, spaceId)

/** Lista los espacios de un parqueadero ordenados por id. */
export const listSpaces = async (db: Db, parkingId: string): Promise<Space[]> => {
  const spaces = await repo.listSpaces(db, parkingId)
  return spaces.sort((a, b) => a.id.localeCompare(b.id, 'es', { numeric: true }))
}

/** Actualiza la tarifa de un tipo de vehículo y devuelve el parqueadero actualizado. */
export const updateRate = async (db: Db, parkingId: string, tipo: VehicleType, rate: Rate) => {
  try {
    await repo.setRate(db, parkingId, tipo, rate)
  } catch (err) {
    if (isConditionalFailure(err)) throw new NotFoundError('Parqueadero')
    throw err
  }
  return requireParking(db, parkingId)
}

/** Crea o reemplaza un parqueadero (datos de prueba). */
export const saveParking = (db: Db, parking: Parking) => repo.putParking(db, parking)

/** Crea o reemplaza un espacio (datos de prueba). */
export const saveSpace = (db: Db, space: Space) => repo.putSpace(db, space)
