export interface CognitoIdTokenPayload {
  sub?: string
  email?: string
  'cognito:groups'?: string[]
  'custom:parqueaderoId'?: string
  exp?: number
  iat?: number
  iss?: string
  aud?: string
  [key: string]: unknown
}

export const decodeJwtPayload = (
  token: string | null | undefined,
): CognitoIdTokenPayload | null => {
  if (!token || typeof token !== 'string') {
    return null
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  const base64Url = parts[1]
  if (!base64Url) {
    return null
  }

  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    if (pad) {
      base64 += '='.repeat(4 - pad)
    }

    const binary = atob(base64)
    try {
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
      const decoded = new TextDecoder().decode(bytes)
      return JSON.parse(decoded) as CognitoIdTokenPayload
    } catch {
      return JSON.parse(binary) as CognitoIdTokenPayload
    }
  } catch {
    return null
  }
}

export const isAdminUser = (idToken: string | null | undefined): boolean => {
  const payload = decodeJwtPayload(idToken)
  if (!payload) {
    return false
  }

  if (typeof payload.exp === 'number') {
    const nowInSeconds = Math.floor(Date.now() / 1000)
    if (payload.exp <= nowInSeconds) {
      return false
    }
  }

  const groups = payload['cognito:groups']
  return Array.isArray(groups) && groups.includes('admin')
}

export const getAdminParqueaderoId = (idToken: string | null | undefined): string | null => {
  const payload = decodeJwtPayload(idToken)
  if (!payload) {
    return null
  }

  const parqueaderoId = payload['custom:parqueaderoId']
  return typeof parqueaderoId === 'string' && parqueaderoId.trim().length > 0
    ? parqueaderoId.trim()
    : null
}
