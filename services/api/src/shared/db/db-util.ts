import { QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import type { CancellationReason, Db, DbItem } from './db-types'

/** Ejecuta un Query siguiendo la paginación hasta traer todos los ítems. */
export const queryAll = async (db: Db, input: Omit<QueryCommandInput, 'TableName'>) => {
  const items: DbItem[] = []
  let ExclusiveStartKey: DbItem | undefined
  do {
    const page = await db.doc.send(
      new QueryCommand({ ...input, TableName: db.table, ExclusiveStartKey }),
    )
    items.push(...(page.Items ?? []))
    ExclusiveStartKey = page.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

/** Motivos por ítem de una transacción cancelada, o `null` si el error es de otro tipo. */
export const cancellationReasons = (err: unknown): CancellationReason[] | null => {
  if (!err || typeof err !== 'object') return null
  if ((err as { name?: string }).name !== 'TransactionCanceledException') return null
  return (err as { CancellationReasons?: CancellationReason[] }).CancellationReasons ?? []
}

/** Indica si el ítem de la transacción falló por su `ConditionExpression`. */
export const failedCondition = (reason: CancellationReason | undefined) =>
  reason?.Code === 'ConditionalCheckFailed'

/** Indica si un comando simple falló por su `ConditionExpression`. */
export const isConditionalFailure = (err: unknown) =>
  (err as { name?: string } | null)?.name === 'ConditionalCheckFailedException'
