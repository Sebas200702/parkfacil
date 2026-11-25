import { createApiProxy } from '@lib/vite-dev-proxy'
import { describe, expect, it } from 'vitest'

describe('createApiProxy', () => {
  it('sin destino no configura proxy', () => {
    expect(createApiProxy(undefined)).toBeUndefined()
    expect(createApiProxy('   ')).toBeUndefined()
  })

  it('reenvía /api al destino quitando el prefijo y la barra final', () => {
    const proxy = createApiProxy('https://abc.execute-api.us-east-1.amazonaws.com/')
    const api = proxy?.['/api']

    expect(api?.target).toBe('https://abc.execute-api.us-east-1.amazonaws.com')
    expect(api?.changeOrigin).toBe(true)
    expect(api?.rewrite?.('/api/parqueaderos/centro-93')).toBe('/parqueaderos/centro-93')
    expect(api?.rewrite?.('/api')).toBe('/')
  })
})
