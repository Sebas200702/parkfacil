import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import type { Db, TransactItem } from '@shared/db/db-types'
import { cancellationReasons, failedCondition, queryAll } from '@shared/db/db-util'
import {
  EVENT_RETENTION_DAYS,
  pkParking,
  SK_EVENT_PREFIX,
  SK_META,
  skEvent,
  skReservation,
  skSpace,
} from '@shared/db/keys-consts'
import type { OccupancyEvent, TransitionWrite } from './sensor-types'

const eventItem = (table: string, e: OccupancyEvent): TransactItem => ({
  Put: {
    TableName: table,
    Item: {
      PK: pkParking(e.parqueaderoId),
      SK: skEvent(e.ocurridoEn, e.espacioId),
      expiraEn: Math.floor(new Date(e.ocurridoEn).getTime() / 1000) + EVENT_RETENTION_DAYS * 86_400,
      ...e,
    },
  },
})

/**
 * Escribe en una sola transacción el efecto de una lectura: estado del espacio (condicionado al
 * estado leído), contador de cupos, reserva CUMPLIDA y evento de ocupación. Se escribe aquí y no
 * en cada dominio porque los cuatro cambios deben ser atómicos.
 * Devuelve `false` si otro evento cambió el espacio o la reserva entre la lectura y la escritura.
 */
export const applyTransition = async (db: Db, w: TransitionWrite): Promise<boolean> => {
  const pk = pkParking(w.reading.parqueaderoId)
  const iso = w.reading.ocurridoEn.toISOString()
  const t = w.transition
  const items: TransactItem[] = [
    {
      Update: {
        TableName: db.table,
        Key: { PK: pk, SK: skSpace(w.reading.espacioId) },
        UpdateExpression: `SET estado = :next, actualizadoEn = :ts${t.fulfillsReservation ? ' REMOVE reservaId' : ''}`,
        ConditionExpression: 'estado = :prev',
        ExpressionAttributeValues: { ':next': t.next, ':prev': w.previous, ':ts': iso },
      },
    },
  ]
  if (t.capacityDelta !== 0) {
    items.push({
      Update: {
        TableName: db.table,
        Key: { PK: pk, SK: SK_META },
        UpdateExpression: 'SET cupos.#t = cupos.#t + :d',
        ExpressionAttributeNames: { '#t': w.tipo },
        ExpressionAttributeValues: { ':d': t.capacityDelta },
      },
    })
  }
  if (t.fulfillsReservation && w.reservaId) {
    items.push({
      Update: {
        TableName: db.table,
        Key: { PK: pk, SK: skReservation(w.reservaId) },
        UpdateExpression: 'SET estado = :done, finalizadaEn = :ts REMOVE GSI2PK, GSI2SK',
        ConditionExpression: 'estado = :active',
        ExpressionAttributeValues: { ':done': 'CUMPLIDA', ':active': 'ACTIVA', ':ts': iso },
      },
    })
  }
  if (w.event) items.push(eventItem(db.table, w.event))
  try {
    await db.doc.send(new TransactWriteCommand({ TransactItems: items }))
    return true
  } catch (err) {
    if (cancellationReasons(err)?.some(failedCondition)) return false
    throw err
  }
}

/** Eventos de ocupación de un parqueadero entre dos fechas. */
export const listEvents = async (db: Db, parkingId: string, from: Date, to: Date) => {
  const items = await queryAll(db, {
    KeyConditionExpression: 'PK = :pk AND SK BETWEEN :from AND :to',
    ExpressionAttributeValues: {
      ':pk': pkParking(parkingId),
      ':from': `${SK_EVENT_PREFIX}${from.toISOString()}`,
      ':to': `${SK_EVENT_PREFIX}${to.toISOString()}~`,
    },
  })
  return items as unknown as OccupancyEvent[]
}
