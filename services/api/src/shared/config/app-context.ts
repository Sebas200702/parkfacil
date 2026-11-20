import { createDb } from '@shared/db/db-client'
import type { Db } from '@shared/db/db-types'

let db: Db | undefined

/** Cliente de base de datos compartido entre invocaciones de la misma Lambda. */
export const getDb = (): Db => {
  if (!db) {
    const table = process.env.TABLE_NAME
    if (!table) throw new Error('Falta la variable de entorno TABLE_NAME')
    db = createDb(table, process.env.DYNAMODB_ENDPOINT || undefined)
  }
  return db
}

/** Lee una variable de entorno opcional; cadena vacía cuenta como ausente. */
export const optionalEnv = (name: string): string | undefined => process.env[name] || undefined
