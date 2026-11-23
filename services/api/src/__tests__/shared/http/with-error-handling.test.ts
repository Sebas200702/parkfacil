import { ErrorCodes } from '@shared/errors/codes'
import { ConflictError } from '@shared/errors/conflict-error'
import { jsonOk } from '@shared/http/api-response'
import { withErrorHandling } from '@shared/http/with-error-handling'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

const run = (fn: () => Promise<never>) => withErrorHandling(fn)({})
const body = (r: { body?: string }) => JSON.parse(r.body ?? '')

describe('withErrorHandling', () => {
  it('deja pasar la respuesta exitosa', async () => {
    const r = await withErrorHandling(async () => jsonOk({ ok: true }, 201))({})
    expect(r.statusCode).toBe(201)
    expect(body(r)).toEqual({ data: { ok: true }, status: 201, error: null })
  })

  it('traduce AppError a su estado y código', async () => {
    const r = await run(async () => {
      throw new ConflictError(ErrorCodes.NO_CAPACITY, 'Sin cupos')
    })
    expect(r.statusCode).toBe(409)
    expect(body(r).error).toEqual({ code: 'NO_CAPACITY', message: 'Sin cupos' })
  })

  it('traduce ZodError a 400 con detalles por campo', async () => {
    const r = await run(async () => {
      z.object({ tipo: z.enum(['CARRO']) }).parse({ tipo: 'BUS' })
      throw new Error('inalcanzable')
    })
    expect(r.statusCode).toBe(400)
    expect(body(r).error.details[0].campo).toBe('tipo')
  })

  it('oculta errores no controlados detrás de un 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const r = await run(async () => {
      throw new Error('detalle interno')
    })
    expect(r.statusCode).toBe(500)
    expect(body(r).error).toEqual({ code: 'INTERNAL', message: 'Error interno' })
  })
})
