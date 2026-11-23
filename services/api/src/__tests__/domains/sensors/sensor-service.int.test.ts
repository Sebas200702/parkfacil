import { findSpace, requireParking } from '@domains/parkings/parking-service'
import { createReservation, listMyReservations } from '@domains/reservations/reservation-service'
import { listEvents, processReading } from '@domains/sensors/sensor-service'
import type { Db } from '@shared/db/db-types'
import { createTestDb, dropTestDb, seedParking } from '@tests/helpers/local-db'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

let db: Db
beforeEach(async () => {
  db = await createTestDb()
  await seedParking(db)
})
afterEach(async () => {
  await dropTestDb(db)
})

const read = (espacioId: string, estado: 'LIBRE' | 'OCUPADO', iso: string) =>
  processReading(db, { parqueaderoId: 'p1', espacioId, estado, ocurridoEn: new Date(iso) })

const carCapacity = async () => (await requireParking(db, 'p1')).cupos.CARRO

describe('processReading', () => {
  it('un carro que entra descuenta un cupo; al salir lo devuelve y registra el cobro', async () => {
    expect(await read('C1', 'OCUPADO', '2026-11-20T10:00:00.000Z')).toEqual({
      cambio: true,
      estado: 'OCUPADO',
    })
    expect(await carCapacity()).toBe(1)

    await read('C1', 'LIBRE', '2026-11-20T11:10:00.000Z')
    expect(await carCapacity()).toBe(2)

    const events = await listEvents(
      db,
      'p1',
      new Date('2026-11-20T00:00:00.000Z'),
      new Date('2026-11-21T00:00:00.000Z'),
    )
    expect(events.map((e) => e.tipo)).toEqual(['ENTRADA', 'SALIDA'])
    expect(events[1]?.monto).toBe(5000)
  })

  it('una lectura repetida no cambia nada', async () => {
    await read('C1', 'OCUPADO', '2026-11-20T10:00:00.000Z')
    expect(await read('C1', 'OCUPADO', '2026-11-20T10:01:00.000Z')).toEqual({
      cambio: false,
      estado: 'OCUPADO',
    })
    expect(await carCapacity()).toBe(1)
  })

  it('cuando llega el carro con reserva, la reserva se cumple sin descontar otro cupo', async () => {
    const r = await createReservation(db, {
      parqueaderoId: 'p1',
      tipo: 'CARRO',
      usuarioId: 'u1',
      now: new Date('2026-11-20T10:00:00.000Z'),
    })
    await read(r.espacioId, 'OCUPADO', '2026-11-20T10:05:00.000Z')
    expect(await carCapacity()).toBe(1)
    const space = await findSpace(db, 'p1', r.espacioId)
    expect(space?.estado).toBe('OCUPADO')
    expect(space?.reservaId).toBeUndefined()
    const [mine] = await listMyReservations(db, 'u1')
    expect(mine?.estado).toBe('CUMPLIDA')
  })

  it('responde 404 si el espacio no existe', async () => {
    await expect(read('X9', 'OCUPADO', '2026-11-20T10:00:00.000Z')).rejects.toMatchObject({
      status: 404,
    })
  })
})
