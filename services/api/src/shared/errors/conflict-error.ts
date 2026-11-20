import { AppError } from './app-error'
import type { ErrorCode } from './errors-types'

/** Conflicto con el estado actual del recurso (409). */
export class ConflictError extends AppError {
  constructor(code: ErrorCode, message: string, details?: unknown) {
    super({ code, message, status: 409, details })
    this.name = 'ConflictError'
  }
}
