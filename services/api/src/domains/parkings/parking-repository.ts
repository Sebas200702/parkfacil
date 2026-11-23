import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { Db, DbItem } from '@shared/db/db-types'
import { queryAll } from '@shared/db/db-util'
import {
  GSI1,
  GSI1_PARKINGS,
  pkParking,
  SK_META,
  SK_SPACE_PREFIX,
  skSpace,
} from '@shared/db/keys-consts'
import type { Parking, Rate, Space, VehicleType } from './parking-types'

const toParking = (i: DbItem): Parking => ({
  id: i.id as string,
  nombre: i.nombre as string,
  direccion: i.direccion as string,
  lat: i.lat as number,
  lng: i.lng as number,
  capacidad: i.capacidad as Parking['capacidad'],
  cupos: i.cupos as Parking['cupos'],
  tarifas: (i.tarifas ?? {}) as Parking['tarifas'],
})

const toSpace = (i: DbItem): Space => ({
  parqueaderoId: i.parqueaderoId as string,
  id: i.id as string,
  tipo: i.tipo as Space['tipo'],
  estado: i.estado as Space['estado'],
  ...(i.reservaId ? { reservaId: i.reservaId as string } : {}),
  actualizadoEn: i.actualizadoEn as string,
})

/** Guarda (crea o reemplaza) el ítem META de un parqueadero. */
export const putParking = async (db: Db, p: Parking) => {
  const Item = { PK: pkParking(p.id), SK: SK_META, GSI1PK: GSI1_PARKINGS, GSI1SK: p.nombre, ...p }
  await db.doc.send(new PutCommand({ TableName: db.table, Item }))
}

/** Lee un parqueadero por id. */
export const getParking = async (db: Db, id: string): Promise<Parking | null> => {
  const Key = { PK: pkParking(id), SK: SK_META }
  const r = await db.doc.send(new GetCommand({ TableName: db.table, Key }))
  return r.Item ? toParking(r.Item) : null
}

/** Lista todos los parqueaderos (GSI1). */
export const listParkings = async (db: Db): Promise<Parking[]> => {
  const items = await queryAll(db, {
    IndexName: GSI1,
    KeyConditionExpression: 'GSI1PK = :p',
    ExpressionAttributeValues: { ':p': GSI1_PARKINGS },
  })
  return items.map(toParking)
}

/** Guarda (crea o reemplaza) un espacio. */
export const putSpace = async (db: Db, s: Space) => {
  const Item = { PK: pkParking(s.parqueaderoId), SK: skSpace(s.id), ...s }
  await db.doc.send(new PutCommand({ TableName: db.table, Item }))
}

/** Lee un espacio de un parqueadero. */
export const getSpace = async (db: Db, parkingId: string, spaceId: string) => {
  const Key = { PK: pkParking(parkingId), SK: skSpace(spaceId) }
  const r = await db.doc.send(new GetCommand({ TableName: db.table, Key }))
  return r.Item ? toSpace(r.Item) : null
}

/** Lista los espacios de un parqueadero. */
export const listSpaces = async (db: Db, parkingId: string): Promise<Space[]> => {
  const items = await queryAll(db, {
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': pkParking(parkingId), ':sk': SK_SPACE_PREFIX },
  })
  return items.map(toSpace)
}

/** Reemplaza la tarifa de un tipo de vehículo. Falla por condición si el parqueadero no existe. */
export const setRate = async (db: Db, parkingId: string, tipo: VehicleType, rate: Rate) => {
  await db.doc.send(
    new UpdateCommand({
      TableName: db.table,
      Key: { PK: pkParking(parkingId), SK: SK_META },
      UpdateExpression: 'SET tarifas.#t = :t',
      ConditionExpression: 'attribute_exists(PK)',
      ExpressionAttributeNames: { '#t': tipo },
      ExpressionAttributeValues: { ':t': rate },
    }),
  )
}
