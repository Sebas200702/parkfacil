import { ForbiddenError } from '@shared/errors/forbidden-error'
import { UnauthorizedError } from '@shared/errors/unauthorized-error'
import type { AuthEvent } from '@shared/http/http-types'
import type { AdminIdentity, Identity } from './identity-types'

/**
 * Normaliza `cognito:groups`. API Gateway HTTP API entrega los claims de arreglo
 * como texto (`"[admin conductor]"`), así que acepta arreglo, `"[a b]"` y `"a,b"`.
 */
export const parseGroups = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (typeof raw !== 'string') return []
  return raw
    .replace(/^\[|\]$/g, '')
    .split(/[\s,]+/)
    .filter(Boolean)
}

/** Construye la identidad a partir de los claims del JWT de Cognito; `null` si no hay `sub`. */
export const identityFromClaims = (
  claims: Record<string, unknown> | undefined,
): Identity | null => {
  const sub = claims?.sub
  if (typeof sub !== 'string' || sub === '') return null
  const email = claims?.email
  const parq = claims?.['custom:parqueaderoId']
  return {
    sub,
    email: typeof email === 'string' ? email : undefined,
    groups: parseGroups(claims?.['cognito:groups']),
    parqueaderoId: typeof parq === 'string' && parq !== '' ? parq : undefined,
  }
}

/** Exige un usuario autenticado. Lanza 401 si el token no trae identidad. */
export const requireUser = (event: Pick<AuthEvent, 'requestContext'>): Identity => {
  const identity = identityFromClaims(event.requestContext?.authorizer?.jwt?.claims)
  if (!identity) throw new UnauthorizedError()
  return identity
}

/**
 * Exige un administrador de parqueadero. El `parqueaderoId` sale SIEMPRE del token,
 * nunca del cuerpo ni de la ruta: así un admin no puede tocar otro parqueadero.
 */
export const requireAdmin = (event: Pick<AuthEvent, 'requestContext'>): AdminIdentity => {
  const identity = requireUser(event)
  if (!identity.groups.includes('admin')) {
    throw new ForbiddenError({ motivo: 'Se requiere el rol admin' })
  }
  if (!identity.parqueaderoId) {
    throw new ForbiddenError({ motivo: 'El usuario no tiene un parqueadero asignado' })
  }
  return { ...identity, parqueaderoId: identity.parqueaderoId }
}
