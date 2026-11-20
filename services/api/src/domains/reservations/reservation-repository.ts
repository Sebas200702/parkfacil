import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import type { Db, DbItem } from '@shared/db/db-types'
import { cancellationReasons, failedCondition, queryAll } from '@shared/db/db-util'
import {
  GSI1,
  GSI2,
  GSI2_ACTIVE_RESERVATIONS,
  gsi1User,
  pkParking,
  SK_META,
  skReservation,
  skSpace,
} from '@shared/db/keys-consts'
import type { ClosingState, InsertOutcome, Reservation } from './reservation-types'

const toReservation = (i: DbItem): Reservation => ({
  id: i.id as string,
  parqueaderoId: i.parqueaderoId as string,
  espacioId: i.espacioId as string,
  usuarioId: i.usuarioId as string,
  tipo: i.tipo as Reservation['tipo'],
  estado: i.estado as Reservation['estado'],
  creadaEn: i.creadaEn as string,
  venceEn: i.venceEn as string,
  ...(i.finalizadaEn ? { finalizadaEn: i.finalizadaEn as string } : {}),
})

/** Reservas de un usuario, de la más reciente a la más antigua (GSI1). */
export const listByUser = async (db: Db, userId: string): Promise<Reservation[]> => {
  const items = await queryAll(db, {
    IndexName: GSI1,
    KeyConditionExpression: 'GSI1PK = :u',
    ExpressionAttributeValues: { ':u': gsi1User(userId) },
    ScanIndexForward: false,
  })
  return items.map(toReservation)
}

/** Lee una reserva. */
export const getReservation = async (db: Db, parkingId: string, id: string) => {
  const Key = { PK: pkParking(parkingId), SK: skReservation(id) }
  const r = await db.doc.send(new GetCommand({ TableName: db.table, Key }))
  return r.Item ? toReservation(r.Item) : null
}

/** Reservas ACTIVA con `venceEn` <= `iso` (GSI2 disperso). */
export const listDue = async (db: Db, iso: string): Promise<Reservation[]> => {
  const items = await queryAll(db, {
    IndexName: GSI2,
    KeyConditionExpression: 'GSI2PK = :p AND GSI2SK <= :now',
    ExpressionAttributeValues: { ':p': GSI2_ACTIVE_RESERVATIONS, ':now': iso },
  })
  return items.map(toReservation)
}

/**
 * Transacción de reserva: descuenta el cupo con la condición cupos > 0, pasa el espacio
 * de LIBRE a RESERVADO y guarda la reserva. Devuelve qué condición falló, si alguna.
 */
export const insertReservation = async (db: Db, r: Reservation): Promise<InsertOutcome> => {
  const pk = pkParking(r.parqueaderoId)
  const reservationItem = {
    PK: pk,
    SK: skReservation(r.id),
    GSI1PK: gsi1User(r.usuarioId),
    GSI1SK: r.creadaEn,
    GSI2PK: GSI2_ACTIVE_RESERVATIONS,
    GSI2SK: r.venceEn,
    ...r,
  }
  try {
    await db.doc.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: db.table,
              Key: { PK: pk, SK: SK_META },
              UpdateExpression: 'SET cupos.#t = cupos.#t - :one',
              ConditionExpression: 'cupos.#t > :zero',
              ExpressionAttributeNames: { '#t': r.tipo },
              ExpressionAttributeValues: { ':one': 1, ':zero': 0 },
            },
          },
          {
            Update: {
              TableName: db.table,
              Key: { PK: pk, SK: skSpace(r.espacioId) },
              UpdateExpression: 'SET estado = :reserved, reservaId = :r, actualizadoEn = :now',
              ConditionExpression: 'estado = :free',
              ExpressionAttributeValues: {
                ':reserved': 'RESERVADO',
                ':free': 'LIBRE',
                ':r': r.id,
                ':now': r.creadaEn,
              },
            },
          },
          {
            Put: {
              TableName: db.table,
              Item: reservationItem,
              ConditionExpression: 'attribute_not_exists(PK)',
            },
          },
        ],
      }),
    )
    return 'OK'
  } catch (err) {
    const reasons = cancellationReasons(err)
    if (reasons && failedCondition(reasons[0])) return 'NO_CAPACITY'
    if (reasons && failedCondition(reasons[1])) return 'SPACE_TAKEN'
    throw err
  }
}

/**
 * Cierra una reserva ACTIVA (VENCIDA o CANCELADA), libera su espacio y devuelve el cupo,
 * todo en una transacción. Devuelve `false` si la reserva ya no estaba activa.
 */
export const closeReservation = async (
  db: Db,
  r: Reservation,
  state: ClosingState,
  iso: string,
) => {
  const pk = pkParking(r.parqueaderoId)
  try {
    await db.doc.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: db.table,
              Key: { PK: pk, SK: skReservation(r.id) },
              UpdateExpression: 'SET estado = :end, finalizadaEn = :now REMOVE GSI2PK, GSI2SK',
              ConditionExpression: 'estado = :active',
              ExpressionAttributeValues: { ':end': state, ':active': 'ACTIVA', ':now': iso },
            },
          },
          {
            Update: {
              TableName: db.table,
              Key: { PK: pk, SK: skSpace(r.espacioId) },
              UpdateExpression: 'SET estado = :free, actualizadoEn = :now REMOVE reservaId',
              ConditionExpression: 'estado = :reserved AND reservaId = :r',
              ExpressionAttributeValues: {
                ':free': 'LIBRE',
                ':reserved': 'RESERVADO',
                ':r': r.id,
                ':now': iso,
              },
            },
          },
          {
            Update: {
              TableName: db.table,
              Key: { PK: pk, SK: SK_META },
              UpdateExpression: 'SET cupos.#t = cupos.#t + :one',
              ExpressionAttributeNames: { '#t': r.tipo },
              ExpressionAttributeValues: { ':one': 1 },
            },
          },
        ],
      }),
    )
    return true
  } catch (err) {
    const reasons = cancellationReasons(err)
    if (reasons && (failedCondition(reasons[0]) || failedCondition(reasons[1]))) return false
    throw err
  }
}
