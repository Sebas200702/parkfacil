import { createApiRewrites } from '@lib/dev-proxy'
import { describe, expect, it } from 'vitest'

describe('createApiRewrites', () => {
  it('sin destino no configura proxy', () => {
    expect(createApiRewrites(undefined)).toEqual([])
    expect(createApiRewrites('   ')).toEqual([])
  })

  it('reenvía /api al destino quitando el prefijo y la barra final', () => {
    const rewrites = createApiRewrites('https://abc.execute-api.us-east-1.amazonaws.com/')

    expect(rewrites).toEqual([
      {
        source: '/api/:path*',
        destination: 'https://abc.execute-api.us-east-1.amazonaws.com/:path*',
      },
    ])
  })
})
