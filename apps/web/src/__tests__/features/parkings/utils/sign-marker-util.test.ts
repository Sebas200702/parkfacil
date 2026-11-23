import {
  signMarkerCount,
  signMarkerHtml,
  signMarkerLabel,
} from '@features/parkings/utils/sign-marker-util'
import { describe, expect, it } from 'vitest'

describe('signMarkerCount', () => {
  it('muestra la cifra de cupos libres', () => {
    expect(signMarkerCount(12)).toBe('12')
    expect(signMarkerCount(0)).toBe('0')
  })

  it('recorta a 99+ y nunca baja de cero', () => {
    expect(signMarkerCount(140)).toBe('99+')
    expect(signMarkerCount(-2)).toBe('0')
  })
})

describe('signMarkerLabel', () => {
  it('nombra el parqueadero y sus cupos', () => {
    expect(signMarkerLabel('Parque 93', 5, false)).toBe('Parque 93, 5 cupos libres')
    expect(signMarkerLabel('Parque 93', 1, false)).toBe('Parque 93, 1 cupo libre')
  })

  it('dice cuando está lleno o seleccionado', () => {
    expect(signMarkerLabel('Zona T', 0, false)).toBe('Zona T, lleno')
    expect(signMarkerLabel('Zona T', 3, true)).toBe('Zona T, 3 cupos libres, seleccionado')
  })
})

describe('signMarkerHtml', () => {
  it('pinta la placa en violeta cuando hay cupos y en gris cuando está llena', () => {
    expect(signMarkerHtml(5, false)).toContain('bg-brand-600')
    expect(signMarkerHtml(0, false)).toContain('bg-asphalt-600')
  })

  it('la selección manda sobre el estado de cupos', () => {
    const html = signMarkerHtml(0, true)

    expect(html).toContain('bg-asphalt-950')
    expect(html).not.toContain('bg-asphalt-600')
  })
})
