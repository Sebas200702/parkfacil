import { api, del, get, post, put } from '@lib/api'
import { getCurrentIdToken } from '@lib/cognito'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@lib/cognito', () => ({
  getCurrentIdToken: vi.fn(),
}))

const mockGetCurrentIdToken = vi.mocked(getCurrentIdToken)
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const createJsonResponse = (body: unknown, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      get: (header: string) =>
        header.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  }
}

describe('HTTP API Client (api.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentIdToken.mockResolvedValue(null)
  })

  describe('Autenticación y Header Authorization: Bearer', () => {
    it('envía el header Authorization: Bearer <token> cuando existe sesión activa', async () => {
      mockGetCurrentIdToken.mockResolvedValueOnce('id-token-xyz-123')
      mockFetch.mockResolvedValueOnce(createJsonResponse({ data: [], status: 200, error: null }))

      await api.get('/parqueaderos')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const callArgs = mockFetch.mock.calls[0]
      const requestInit = callArgs?.[1] as RequestInit
      const headers = requestInit.headers as Record<string, string>

      expect(headers.Authorization).toBe('Bearer id-token-xyz-123')
      expect(mockGetCurrentIdToken).toHaveBeenCalledTimes(1)
    })

    it('no incluye el header Authorization cuando no hay sesión activa', async () => {
      mockGetCurrentIdToken.mockResolvedValueOnce(null)
      mockFetch.mockResolvedValueOnce(createJsonResponse({ data: [], status: 200, error: null }))

      await api.get('/parqueaderos')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const callArgs = mockFetch.mock.calls[0]
      const requestInit = callArgs?.[1] as RequestInit
      const headers = requestInit.headers as Record<string, string>

      expect(headers.Authorization).toBeUndefined()
    })

    it('respeta un header Authorization explícito si se pasa en options', async () => {
      mockGetCurrentIdToken.mockResolvedValueOnce('token-ignorado')
      mockFetch.mockResolvedValueOnce(createJsonResponse({ data: [], status: 200, error: null }))

      await api.get('/admin', {
        headers: {
          Authorization: 'Bearer token-manual',
        },
      })

      const callArgs = mockFetch.mock.calls[0]
      const requestInit = callArgs?.[1] as RequestInit
      const headers = requestInit.headers as Record<string, string>

      expect(headers.Authorization).toBe('Bearer token-manual')
    })
  })

  describe('Métodos HTTP (get, post, put, delete)', () => {
    it('api.get ejecuta petición GET con parámetros de consulta', async () => {
      mockFetch.mockResolvedValueOnce(createJsonResponse({ ok: true }))

      await api.get('/parqueaderos', {
        params: { tipo: 'CARRO', activo: true },
      })

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs?.[0]).toContain('/parqueaderos?tipo=CARRO&activo=true')
      expect(callArgs?.[1]?.method).toBe('GET')
    })

    it('api.post ejecuta POST, serializa el cuerpo y agrega Content-Type application/json', async () => {
      const payload = { parqueaderoId: 'p1', tipo: 'MOTO' }
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({ data: { id: 'r1' }, status: 201, error: null }, 201),
      )

      const result = await api.post('/reservas', payload)

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs?.[1]?.method).toBe('POST')
      expect(callArgs?.[1]?.body).toBe(JSON.stringify(payload))
      const headers = callArgs?.[1]?.headers as Record<string, string>
      expect(headers['Content-Type']).toBe('application/json')
      expect(result.status).toBe(201)
      expect(result.data).toEqual({ id: 'r1' })
    })

    it('api.put ejecuta PUT con cuerpo serializado', async () => {
      const tarifa = { tipo: 'CARRO', valorHora: 5000, valorFraccion: 1500, valorDia: 35000 }
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({ data: tarifa, status: 200, error: null }),
      )

      const result = await api.put('/admin/tarifas', tarifa)

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs?.[1]?.method).toBe('PUT')
      expect(callArgs?.[1]?.body).toBe(JSON.stringify(tarifa))
      expect(result.data).toEqual(tarifa)
    })

    it('api.delete ejecuta DELETE correctamente', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({ data: { cancelada: true }, status: 200, error: null }),
      )

      const result = await api.delete('/reservas/r-100')

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs?.[1]?.method).toBe('DELETE')
      expect(result.data).toEqual({ cancelada: true })
    })

    it('las funciones exportadas get, post, put, del funcionan igual que el objeto api', async () => {
      mockFetch.mockResolvedValue(createJsonResponse({ ok: true }))

      await get('/item')
      await post('/item', { x: 1 })
      await put('/item', { x: 2 })
      await del('/item/1')

      expect(mockFetch).toHaveBeenCalledTimes(4)
    })
  })

  describe('Normalización de Respuestas y Manejo de Errores', () => {
    it('mantiene la estructura estándar cuando el backend responde con { data, status, error }', async () => {
      const backendResponse = {
        data: { id: 'p-1', nombre: 'Parqueadero Central' },
        status: 200,
        error: null,
      }
      mockFetch.mockResolvedValueOnce(createJsonResponse(backendResponse))

      const result = await api.get('/parqueaderos/p-1')

      expect(result).toEqual(backendResponse)
    })

    it('normaliza respuestas HTTP de error conocidas como 409 NO_CAPACITY', async () => {
      const errorPayload = {
        data: null,
        status: 409,
        error: {
          code: 'NO_CAPACITY',
          message: 'Sin cupos disponibles',
        },
      }
      mockFetch.mockResolvedValueOnce(createJsonResponse(errorPayload, 409))

      const result = await api.post('/reservas', { parqueaderoId: 'p1', tipo: 'CARRO' })

      expect(result.status).toBe(409)
      expect(result.data).toBeNull()
      expect(result.error?.code).toBe('NO_CAPACITY')
      expect(result.error?.message).toBe('Sin cupos disponibles')
    })

    it('normaliza errores sin estructura { data, status, error } a partir del código HTTP', async () => {
      mockFetch.mockResolvedValueOnce(createJsonResponse({ message: 'No autorizado' }, 401))

      const result = await api.get('/admin/metricas')

      expect(result.status).toBe(401)
      expect(result.data).toBeNull()
      expect(result.error?.code).toBe('UNAUTHORIZED')
      expect(result.error?.message).toBe('No autorizado')
    })

    it('captura fallos de red sin lanzar excepciones y devuelve { data: null, status: 0, error }', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const result = await api.get('/parqueaderos')

      expect(result.status).toBe(0)
      expect(result.data).toBeNull()
      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toBe('Failed to fetch')
    })

    it('captura errores de red que no son instancias de Error', async () => {
      mockFetch.mockRejectedValueOnce('Network dropped abruptly')

      const result = await api.post('/reservas')

      expect(result.status).toBe(0)
      expect(result.data).toBeNull()
      expect(result.error?.code).toBe('NETWORK_ERROR')
      expect(result.error?.message).toBe('Error de conexión de red')
    })
  })
})
