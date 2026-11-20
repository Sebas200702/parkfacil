import {
  identityFromClaims,
  parseGroups,
  requireAdmin,
  requireUser,
} from '@shared/auth/identity-util'
import { describe, expect, it } from 'vitest'

const eventWith = (claims?: Record<string, unknown>) =>
  ({
    requestContext: { authorizer: claims ? { jwt: { claims, scopes: [] } } : undefined },
  }) as never

describe('parseGroups', () => {
  it.each([
    [
      ['admin', 'conductor'],
      ['admin', 'conductor'],
    ],
    ['[admin conductor]', ['admin', 'conductor']],
    ['admin,conductor', ['admin', 'conductor']],
    ['[]', []],
    [undefined, []],
  ])('%j -> %j', (raw, expected) => {
    expect(parseGroups(raw)).toEqual(expected)
  })
})

describe('identityFromClaims', () => {
  it('devuelve null sin sub', () => {
    expect(identityFromClaims({ email: 'a@b.co' })).toBeNull()
  })

  it('lee email, grupos y parqueadero', () => {
    expect(
      identityFromClaims({
        sub: 'u1',
        email: 'a@b.co',
        'cognito:groups': '[admin]',
        'custom:parqueaderoId': 'p1',
      }),
    ).toEqual({ sub: 'u1', email: 'a@b.co', groups: ['admin'], parqueaderoId: 'p1' })
  })
})

describe('requireUser / requireAdmin', () => {
  it('401 sin token', () => {
    expect(() => requireUser(eventWith())).toThrowError(expect.objectContaining({ status: 401 }))
  })

  it('403 para un conductor', () => {
    const event = eventWith({ sub: 'u1', 'cognito:groups': '[conductor]' })
    expect(() => requireAdmin(event)).toThrowError(expect.objectContaining({ status: 403 }))
  })

  it('403 para un admin sin parqueadero asignado', () => {
    const event = eventWith({ sub: 'u1', 'cognito:groups': '[admin]' })
    expect(() => requireAdmin(event)).toThrowError(
      expect.objectContaining({ status: 403, details: { motivo: expect.any(String) } }),
    )
  })

  it('devuelve el parqueadero del token', () => {
    const event = eventWith({
      sub: 'u1',
      'cognito:groups': '[admin]',
      'custom:parqueaderoId': 'p1',
    })
    expect(requireAdmin(event).parqueaderoId).toBe('p1')
  })
})
