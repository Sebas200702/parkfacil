import type { DynamoDBDocumentClient, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb'

export interface Db {
  doc: DynamoDBDocumentClient
  table: string
}

export interface CancellationReason {
  Code?: string
}

export type TransactItem = NonNullable<TransactWriteCommandInput['TransactItems']>[number]

export type DbItem = Record<string, unknown>
