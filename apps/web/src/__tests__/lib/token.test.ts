import { decodeJwtPayload, getAdminParqueaderoId, isAdminUser } from '@lib/token'
import { describe, expect, it } from 'vitest'

const createMockJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${body}.mockSignature`
}

describe('Token Utilities (token.ts)', () => {
  describe('decodeJwtPayload', () => {
    it('decodifica correctamente el payload de un JWT simulado', () => {
      const payload = { sub: 'usr-123', email: 'test@parkfacil.com' }
      const token = createMockJwt(payload)

      const result = decodeJwtPayload(token)
      expect(result).toMatchObject(payload)
    })

    it('devuelve null si el token es nulo, indefinido o no es string', () => {
      expect(decodeJwtPayload(null)).toBeNull()
      expect(decodeJwtPayload(undefined)).toBeNull()
      expect(decodeJwtPayload('')).toBeNull()
    })

    it('devuelve null si el token no tiene 3 partes separadas por puntos', () => {
      expect(decodeJwtPayload('invalido')).toBeNull()
      expect(decodeJwtPayload('header.payload')).toBeNull()
      expect(decodeJwtPayload('a.b.c.d')).toBeNull()
    })

    it('devuelve null si el base64 es inválido o no es JSON válido', () => {
      expect(decodeJwtPayload('header.%%%invalid%%%.sig')).toBeNull()
    })
  })

  describe('isAdminUser', () => {
    it('retorna true cuando el token contiene cognito:groups con "admin" y no está expirado', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJwt({
        sub: 'admin-1',
        'cognito:groups': ['admin'],
        exp: futureExp,
      })

      expect(isAdminUser(token)).toBe(true)
    })

    it('retorna true cuando el usuario tiene múltiples grupos incluyendo "admin"', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJwt({
        sub: 'admin-2',
        'cognito:groups': ['conductor', 'admin'],
        exp: futureExp,
      })

      expect(isAdminUser(token)).toBe(true)
    })

    it('retorna false si el grupo "admin" no está presente en cognito:groups', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJwt({
        sub: 'conductor-1',
        'cognito:groups': ['conductor'],
        exp: futureExp,
      })

      expect(isAdminUser(token)).toBe(false)
    })

    it('retorna false si el token no contiene la propiedad cognito:groups', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJwt({
        sub: 'user-sin-grupos',
        exp: futureExp,
      })

      expect(isAdminUser(token)).toBe(false)
    })

    it('retorna false si el token está expirado aunque tenga el grupo admin', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 300
      const token = createMockJwt({
        sub: 'admin-expirado',
        'cognito:groups': ['admin'],
        exp: pastExp,
      })

      expect(isAdminUser(token)).toBe(false)
    })

    it('retorna false si el token es nulo o inválido', () => {
      expect(isAdminUser(null)).toBe(false)
      expect(isAdminUser('token-falso')).toBe(false)
    })
  })

  describe('getAdminParqueaderoId', () => {
    it('extrae el atributo custom:parqueaderoId correctamente del token', () => {
      const token = createMockJwt({
        sub: 'admin-1',
        'cognito:groups': ['admin'],
        'custom:parqueaderoId': 'parq-centro-01',
      })

      expect(getAdminParqueaderoId(token)).toBe('parq-centro-01')
    })

    it('retorna null si el atributo custom:parqueaderoId no existe en el token', () => {
      const token = createMockJwt({
        sub: 'admin-1',
        'cognito:groups': ['admin'],
      })

      expect(getAdminParqueaderoId(token)).toBeNull()
    })

    it('retorna null si custom:parqueaderoId es una cadena vacía', () => {
      const token = createMockJwt({
        sub: 'admin-1',
        'custom:parqueaderoId': '   ',
      })

      expect(getAdminParqueaderoId(token)).toBeNull()
    })

    it('retorna null cuando el token es nulo o inválido', () => {
      expect(getAdminParqueaderoId(null)).toBeNull()
      expect(getAdminParqueaderoId('no-valido')).toBeNull()
    })
  })
})
