import { requireParking } from '@domains/parkings/parking-service'
import type { Db } from '@shared/db/db-types'
import { createTestDb, dropTestDb, seedParking } from '@tests/helpers/local-db'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

let db: Db
vi.mock('@shared/config/app-context', () => ({
  getDb: () => db,
  optionalEnv: () => undefined,
}))

const { handler } = await import('@handlers/admin-rates')

beforeAll(async () => {
  db = await createTestDb()
  await seedParking(db, 'p1')
  await seedParking(db, 'p2')
})
afterAll(async () => {
  await dropTestDb(db)
})

const request = (claims: Record<string, unknown>, body: unknown) =>
  handler({
    body: JSON.stringify(body),
    requestContext: { authorizer: { jwt: { claims, scopes: [] } } },
  } as never)

const ADMIN_P1 = { sub: 'a1', 'cognito:groups': '[admin]', 'custom:parqueaderoId': 'p1' }

describe('PUT /admin/tarifas', () => {
  it('actualiza el parqueadero del token e ignora el parqueaderoId del cuerpo', async () => {
    const res = await request(ADMIN_P1, {
      parqueaderoId: 'p2',
      tipo: 'MOTO',
      valorHora: 2000,
      valorFraccion: 500,
      valorDia: 12000,
    })
    expect(res.statusCode).toBe(200)
    expect((await requireParking(db, 'p1')).tarifas.MOTO).toEqual({
      valorHora: 2000,
      valorFraccion: 500,
      valorDia: 12000,
    })
    expect((await requireParking(db, 'p2')).tarifas.MOTO).toBeUndefined()
  })

  it('un conductor recibe 403 y no cambia nada', async () => {
    const res = await request(
      { sub: 'c1', 'cognito:groups': '[conductor]', 'custom:parqueaderoId': 'p2' },
      { tipo: 'CARRO', valorHora: 1, valorFraccion: 1, valorDia: 1 },
    )
    expect(res.statusCode).toBe(403)
    expect((await requireParking(db, 'p2')).tarifas.CARRO?.valorHora).toBe(4000)
  })

  it('valida el cuerpo con 400', async () => {
    const res = await request(ADMIN_P1, { tipo: 'BUS', valorHora: -1 })
    expect(res.statusCode).toBe(400)
  })
})
