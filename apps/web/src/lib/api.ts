import { getCurrentIdToken } from './cognito'
import type { ApiResponse, ErrorCode } from './types'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined | null>
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const getErrorCodeForStatus = (status: number): ErrorCode => {
  switch (status) {
    case 400:
      return 'VALIDATION'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONCURRENT_UPDATE'
    case 503:
      return 'SERVICE_UNAVAILABLE'
    default:
      return 'INTERNAL'
  }
}

const isApiResponse = <T>(obj: unknown): obj is ApiResponse<T> =>
  typeof obj === 'object' && obj !== null && 'data' in obj && 'status' in obj && 'error' in obj

const getBaseUrl = (): string => (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string => {
  const isAbsolute = /^https?:\/\//i.test(endpoint)
  const base = getBaseUrl()
  let url = endpoint

  if (!isAbsolute) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    url = base ? `${base}${cleanEndpoint}` : cleanEndpoint
  }

  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    }
    const query = searchParams.toString()
    if (query) {
      url += (url.includes('?') ? '&' : '?') + query
    }
  }

  return url
}

const serializeBody = (body?: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) {
    return undefined
  }
  if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    return JSON.stringify(body)
  }
  return body as BodyInit
}

const buildHeaders = async (
  options?: RequestOptions,
  bodyInit?: BodyInit,
): Promise<Record<string, string>> => {
  const token = await getCurrentIdToken()
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options?.headers,
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`
  }

  if (bodyInit && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

const parseResponseBody = async (res: Response): Promise<unknown> => {
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }

  const text = await res.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const normalizeResponse = <T>(res: Response, parsedData: unknown): ApiResponse<T> => {
  if (isApiResponse<T>(parsedData)) {
    return {
      data: parsedData.data,
      status: typeof parsedData.status === 'number' ? parsedData.status : res.status,
      error: parsedData.error,
    }
  }

  if (res.ok) {
    return {
      data: (parsedData as T) ?? null,
      status: res.status,
      error: null,
    }
  }

  const payloadObj = typeof parsedData === 'object' && parsedData !== null ? parsedData : null
  const codeFromPayload =
    payloadObj && 'code' in payloadObj ? String((payloadObj as { code: unknown }).code) : undefined
  const messageFromPayload =
    payloadObj && 'message' in payloadObj
      ? String((payloadObj as { message: unknown }).message)
      : typeof parsedData === 'string'
        ? parsedData
        : undefined

  return {
    data: null,
    status: res.status,
    error: {
      code: (codeFromPayload as ErrorCode) || getErrorCodeForStatus(res.status),
      message: messageFromPayload || res.statusText || 'Error en la petición HTTP',
      details: parsedData,
    },
  }
}

const request = async <T = unknown>(
  method: HttpMethod,
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    const url = buildUrl(endpoint, options?.params)
    const bodyInit = serializeBody(body)
    const headers = await buildHeaders(options, bodyInit)

    const { headers: _ignoredHeaders, params: _ignoredParams, ...restOptions } = options ?? {}

    const res = await fetch(url, {
      method,
      headers,
      body: bodyInit,
      ...restOptions,
    })

    const parsedData = await parseResponseBody(res)
    return normalizeResponse<T>(res, parsedData)
  } catch (err) {
    return {
      data: null,
      status: 0,
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Error de conexión de red',
        details: err,
      },
    }
  }
}

export const get = <T = unknown>(
  endpoint: string,
  options?: RequestOptions,
): Promise<ApiResponse<T>> => request<T>('GET', endpoint, undefined, options)

export const post = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiResponse<T>> => request<T>('POST', endpoint, body, options)

export const put = <T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiResponse<T>> => request<T>('PUT', endpoint, body, options)

export const del = <T = unknown>(
  endpoint: string,
  bodyOrOptions?: unknown,
  maybeOptions?: RequestOptions,
): Promise<ApiResponse<T>> => {
  if (maybeOptions !== undefined) {
    return request<T>('DELETE', endpoint, bodyOrOptions, maybeOptions)
  }
  const isOptionsObject =
    typeof bodyOrOptions === 'object' &&
    bodyOrOptions !== null &&
    ('headers' in bodyOrOptions || 'params' in bodyOrOptions || 'signal' in bodyOrOptions)

  if (isOptionsObject) {
    return request<T>('DELETE', endpoint, undefined, bodyOrOptions as RequestOptions)
  }

  return request<T>('DELETE', endpoint, bodyOrOptions, undefined)
}

export const api = {
  get,
  post,
  put,
  delete: del,
}

export default api
