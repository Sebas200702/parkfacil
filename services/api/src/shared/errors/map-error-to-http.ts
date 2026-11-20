import type { ApiError } from '@shared/http/http-types'
import { ZodError } from 'zod'
import { AppError } from './app-error'
import { ErrorCodes } from './codes'

/**
 * Traduce cualquier error a estado HTTP y cuerpo de error.
 * Los errores no controlados se ocultan detrás de un 500 genérico.
 */
export const mapErrorToHttp = (error: unknown): { status: number; error: ApiError } => {
  if (error instanceof AppError) {
    return {
      status: error.status,
      error: { code: error.code, message: error.message, details: error.details },
    }
  }
  if (error instanceof ZodError) {
    const details = error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }))
    return {
      status: 400,
      error: { code: ErrorCodes.VALIDATION, message: 'Datos inválidos', details },
    }
  }
  if (error instanceof SyntaxError) {
    return {
      status: 400,
      error: { code: ErrorCodes.INVALID_JSON, message: 'El cuerpo no es JSON válido' },
    }
  }
  return { status: 500, error: { code: ErrorCodes.INTERNAL, message: 'Error interno' } }
}
