import { AppError } from './app-error'
import { ErrorCodes } from './codes'

/** Petición sin sesión válida (401). */
export class UnauthorizedError extends AppError {
  constructor() {
    super({ code: ErrorCodes.UNAUTHORIZED, message: 'Debes iniciar sesión', status: 401 })
    this.name = 'UnauthorizedError'
  }
}
