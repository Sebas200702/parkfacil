import { distanceMeters, formatDistance } from '@shared/utils/geo-util'
import { describe, expect, it } from 'vitest'

const PARQUE_93 = { lat: 4.6767, lng: -74.0483 }
const ZONA_T = { lat: 4.6669, lng: -74.0537 }

describe('distanceMeters', () => {
  it('mide la distancia entre dos puntos de Bogotá', () => {
    const meters = distanceMeters(PARQUE_93, ZONA_T)

    expect(meters).toBeGreaterThan(1200)
    expect(meters).toBeLessThan(1300)
  })

  it('da cero para el mismo punto', () => {
    expect(distanceMeters(PARQUE_93, PARQUE_93)).toBe(0)
  })
})

describe('formatDistance', () => {
  it('muestra metros redondeados a decenas por debajo de un kilómetro', () => {
    expect(formatDistance(347)).toBe('a 350 m')
    expect(formatDistance(3)).toBe('a 10 m')
  })

  it('muestra kilómetros con coma decimal desde un kilómetro', () => {
    expect(formatDistance(1240)).toBe('a 1,2 km')
    expect(formatDistance(3000)).toBe('a 3 km')
  })
})
