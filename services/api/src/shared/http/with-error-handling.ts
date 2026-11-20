import { mapErrorToHttp } from '@shared/errors/map-error-to-http'
import { jsonError } from './api-response'
import type { HttpHandler } from './http-types'

/**
 * Envuelve un handler HTTP de Lambda: captura cualquier excepción, la registra
 * y devuelve la respuesta JSON de error correspondiente.
 */
export const withErrorHandling =
  <E>(handler: HttpHandler<E>): HttpHandler<E> =>
  async (event) => {
    try {
      return await handler(event)
    } catch (err) {
      const { status, error } = mapErrorToHttp(err)
      if (status >= 500) console.error('API request failed', err)
      else console.warn('API request rejected', { status, code: error.code })
      return jsonError(error, status)
    }
  }
