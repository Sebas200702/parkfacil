import { listSpaces, requireParking } from '@domains/parkings/parking-service'
import {
  cancelReservation,
  createReservation,
  expireAllDue,
  expireIfDue,
  listMyReservations,
} from '@domains/reservations/reservation-service'
import type { Db } from '@shared/db/db-types'
import { createTestDb, dropTestDb, seedParking } from '@tests/helpers/local-db'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const NOW = new Date('2026-11-20T10:00:00.000Z')
const LATER = new Date('2026-11-20T10:16:00.000Z')

let db: Db
beforeEach(async () => {
  db = await createTestDb()
})
afterEach(async () => {
  await dropTestDb(db)
})

const reserve = (usuarioId: string, tipo: 'CARRO' | 'MOTO' = 'CARRO', now = NOW) =>
  createReservation(db, { parqueaderoId: 'p1', tipo, usuarioId, now })

const carCapacity = async () => (await requireParking(db, 'p1')).cupos.CARRO

describe('createReservation', () => {
  it('descuenta el cupo, aparta un espacio y vence a los 15 minutos', async () => {
    await seedParking(db)
    const r = await reserve('u1')
    expect(r).toMatchObject({ estado: 'ACTIVA', venceEn: '2026-11-20T10:15:00.000Z' })
    expect(await carCapacity()).toBe(1)
    const space = (await listSpaces(db, 'p1')).find((s) => s.id === r.espacioId)
    expect(space).toMatchObject({ estado: 'RESERVADO', reservaId: r.id })
  })

  it('con un cupo y 5 reservas simultáneas gana una; las demás reciben 409 "Sin cupos"', async () => {
    await seedParking(db, 'p1', 1, 0)
    const results = await Promise.allSettled(['a', 'b', 'c', 'd', 'e'].map((u) => reserve(u)))
    const rejected = results.filter((r) => r.status === 'rejected')
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(rejected).toHaveLength(4)
    for (const r of rejected) {
      expect(r.reason).toMatchObject({ status: 409, code: 'NO_CAPACITY', message: 'Sin cupos' })
    }
    expect(await carCapacity()).toBe(0)
  })

  it('no deja que un conductor tenga dos reservas activas', async () => {
    await seedParking(db)
    await reserve('u1')
    await expect(reserve('u1', 'MOTO')).rejects.toMatchObject({
      status: 409,
      code: 'ACTIVE_RESERVATION',
    })
  })

  it('responde 404 si el parqueadero no existe', async () => {
    await expect(reserve('u1')).rejects.toMatchObject({ status: 404 })
  })
})

describe('cancelReservation', () => {
  it('libera el espacio y devuelve el cupo; cancelar otra vez responde 409', async () => {
    await seedParking(db)
    const r = await reserve('u1')
    expect((await cancelReservation(db, 'u1', r.id, NOW)).estado).toBe('CANCELADA')
    expect(await carCapacity()).toBe(2)
    expect((await listSpaces(db, 'p1')).every((s) => s.estado === 'LIBRE')).toBe(true)
    await expect(cancelReservation(db, 'u1', r.id, NOW)).rejects.toMatchObject({
      status: 409,
      code: 'RESERVATION_NOT_ACTIVE',
    })
  })

  it('responde 404 si la reserva es de otro usuario y no cambia nada', async () => {
    await seedParking(db)
    const r = await reserve('u1')
    await expect(cancelReservation(db, 'u2', r.id)).rejects.toMatchObject({ status: 404 })
    expect(await carCapacity()).toBe(1)
  })
})

describe('vencimiento', () => {
  it('expireIfDue no vence antes de la hora, vence después y es idempotente', async () => {
    await seedParking(db)
    const r = await reserve('u1')
    const target = { parqueaderoId: 'p1', reservaId: r.id }
    expect(await expireIfDue(db, target, NOW)).toBe(false)
    expect(await expireIfDue(db, target, LATER)).toBe(true)
    expect(await expireIfDue(db, target, LATER)).toBe(false)
    expect(await carCapacity()).toBe(2)
    const [mine] = await listMyReservations(db, 'u1')
    expect(mine?.estado).toBe('VENCIDA')
  })

  it('expireAllDue vence solo las reservas cuya hora pasó', async () => {
    await seedParking(db, 'p1', 3, 0)
    await reserve('u1')
    await reserve('u2', 'CARRO', new Date('2026-11-20T10:10:00.000Z'))
    expect(await expireAllDue(db, LATER)).toBe(1)
    expect(await carCapacity()).toBe(2)
    const [u2] = await listMyReservations(db, 'u2')
    expect(u2?.estado).toBe('ACTIVA')
  })
})
