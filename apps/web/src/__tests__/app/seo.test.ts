import robots from '@app/robots'
import sitemap from '@app/sitemap'
import { describe, expect, it } from 'vitest'

describe('robots.txt', () => {
  it('allows the public site, blocks private routes and points to the sitemap', () => {
    const rules = robots()

    expect(rules.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/reservas/', '/ui/'],
    })
    expect(rules.sitemap).toBe('https://parkfacil.app/sitemap.xml')
    expect(rules.host).toBe('https://parkfacil.app')
  })
})

describe('sitemap.xml', () => {
  it('lists only the public pages with absolute URLs ending in a slash', () => {
    const urls = sitemap().map((entry) => entry.url)

    expect(urls).toEqual([
      'https://parkfacil.app/',
      'https://parkfacil.app/mapa/',
      'https://parkfacil.app/registro/',
      'https://parkfacil.app/login/',
      'https://parkfacil.app/privacidad.html',
    ])
  })

  it('gives the landing the highest priority', () => {
    const [home, ...rest] = sitemap()

    expect(home?.priority).toBe(1)
    for (const entry of rest) expect(entry.priority).toBeLessThan(1)
  })
})
