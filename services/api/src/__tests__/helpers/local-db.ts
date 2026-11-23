import { randomUUID } from 'node:crypto'
import { CreateTableCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb'
import { saveParking, saveSpace } from '@domains/parkings/parking-service'
import type { Parking, Space } from '@domains/parkings/parking-types'
import { createDb } from '@shared/db/db-client'
import type { Db } from '@shared/db/db-types'

/** DynamoDB Local por defecto; con el emulador se pasa DYNAMODB_ENDPOINT. */
export const LOCAL_ENDPOINT = process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000'

const T0 = '2026-11-20T10:00:00.000Z'

const gsi = (name: string) => ({
  IndexName: name,
  KeySchema: [
    { AttributeName: `${name}PK`, KeyType: 'HASH' as const },
    { AttributeName: `${name}SK`, KeyType: 'RANGE' as const },
  ],
  Projection: { ProjectionType: 'ALL' as const },
})

/** Crea una tabla nueva con el mismo esquema de infra/template.yaml. */
export const createTestDb = async (): Promise<Db> => {
  const db = createDb(`parkfacil-test-${randomUUID()}`, LOCAL_ENDPOINT)
  const attrs = ['PK', 'SK', 'GSI1PK', 'GSI1SK', 'GSI2PK', 'GSI2SK']
  await db.doc.send(
    new CreateTableCommand({
      TableName: db.table,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: attrs.map((AttributeName) => ({ AttributeName, AttributeType: 'S' })),
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      GlobalSecondaryIndexes: [gsi('GSI1'), gsi('GSI2')],
    }),
  )
  return db
}

/** Borra la tabla de prueba. */
export const dropTestDb = (db: Db) => db.doc.send(new DeleteTableCommand({ TableName: db.table }))

/** Parqueadero de prueba con `carros` espacios CARRO y `motos` espacios MOTO, todos LIBRE. */
export const seedParking = async (db: Db, id = 'p1', carros = 2, motos = 1): Promise<Parking> => {
  const parking: Parking = {
    id,
    nombre: `Parqueadero ${id}`,
    direccion: 'Calle 1 # 2-3',
    lat: 4.6,
    lng: -74.07,
    capacidad: { CARRO: carros, MOTO: motos },
    cupos: { CARRO: carros, MOTO: motos },
    tarifas: { CARRO: { valorHora: 4000, valorFraccion: 1000, valorDia: 30000 } },
  }
  await saveParking(db, parking)
  const spaces: Space[] = [
    ...Array.from({ length: carros }, (_, i) => ({ id: `C${i + 1}`, tipo: 'CARRO' as const })),
    ...Array.from({ length: motos }, (_, i) => ({ id: `M${i + 1}`, tipo: 'MOTO' as const })),
  ].map((s) => ({ ...s, parqueaderoId: id, estado: 'LIBRE' as const, actualizadoEn: T0 }))
  await Promise.all(spaces.map((s) => saveSpace(db, s)))
  return parking
}
