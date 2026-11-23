import { AppError } from './app-error'
import { ErrorCodes } from './codes'

/** Usuario autenticado sin permiso para la acción (403). */
export class ForbiddenError extends AppError {
  constructor(details?: unknown) {
    super({
      code: ErrorCodes.FORBIDDEN,
      message: 'No tienes permiso para esta acción',
      status: 403,
      details,
    })
    this.name = 'ForbiddenError'
  }
}
