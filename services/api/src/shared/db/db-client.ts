import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import type { Db } from './db-types'

/**
 * Crea el cliente de DynamoDB para la tabla única.
 * `endpoint` solo se usa con DynamoDB Local (pruebas); en Lambda se usan las credenciales del rol.
 */
export const createDb = (table: string, endpoint?: string): Db => {
  const client = endpoint
    ? new DynamoDBClient({
        endpoint,
        region: process.env.AWS_REGION ?? 'us-east-1',
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
      })
    : new DynamoDBClient({})
  const doc = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  })
  return { doc, table }
}
