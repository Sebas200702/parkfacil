import { AppError } from './app-error'
import { ErrorCodes } from './codes'

/** Recurso inexistente o que el usuario no puede ver (404). */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super({ code: ErrorCodes.NOT_FOUND, message: `${resource} no encontrado`, status: 404 })
    this.name = 'NotFoundError'
  }
}
