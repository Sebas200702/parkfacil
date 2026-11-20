import { isValidApiKey } from '@shared/auth/api-key-util'
import { describe, expect, it } from 'vitest'

describe('isValidApiKey', () => {
  it('acepta solo la clave exacta', () => {
    expect(isValidApiKey('secreta', 'secreta')).toBe(true)
    expect(isValidApiKey('otra', 'secreta')).toBe(false)
  })

  it('rechaza si falta la clave recibida o la esperada', () => {
    expect(isValidApiKey(undefined, 'secreta')).toBe(false)
    expect(isValidApiKey('secreta', undefined)).toBe(false)
    expect(isValidApiKey('', '')).toBe(false)
  })
})
