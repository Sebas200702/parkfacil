import type { AppErrorParams, ErrorCode } from './errors-types'

/**
 * Error base de la aplicación. Lleva código, estado HTTP y detalles opcionales
 * que `withErrorHandling` traduce a una respuesta JSON.
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly status: number
  public readonly details?: unknown

  constructor(params: AppErrorParams) {
    super(params.message)
    this.name = 'AppError'
    this.code = params.code
    this.status = params.status ?? 500
    this.details = params.details
  }
}
