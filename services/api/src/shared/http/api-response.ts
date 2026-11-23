import type { ApiError, ApiResponse, LambdaResponse } from './http-types'

const HEADERS = { 'content-type': 'application/json' }

/** Respuesta JSON exitosa con la estructura normalizada `{ data, status, error }`. */
export const jsonOk = <T>(data: T, status = 200): LambdaResponse => ({
  statusCode: status,
  headers: HEADERS,
  body: JSON.stringify({ data, status, error: null } satisfies ApiResponse<T>),
})

/** Respuesta JSON de error con la estructura normalizada `{ data, status, error }`. */
export const jsonError = (error: ApiError, status = 500): LambdaResponse => ({
  statusCode: status,
  headers: HEADERS,
  body: JSON.stringify({ data: null, status, error } satisfies ApiResponse<null>),
})
