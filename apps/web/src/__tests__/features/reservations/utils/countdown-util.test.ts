import {
  formatClock,
  percentLeft,
  secondsLeft,
  spokenTimeLeft,
} from '@features/reservations/utils/countdown-util'
import { describe, expect, it } from 'vitest'

const NOW = Date.parse('2026-11-25T15:00:00.000Z')

describe('secondsLeft', () => {
  it('cuenta los segundos hasta la hora de vencimiento', () => {
    expect(secondsLeft('2026-11-25T15:15:00.000Z', NOW)).toBe(900)
  })

  it('redondea hacia arriba para no mostrar 00:00 antes de tiempo', () => {
    expect(secondsLeft('2026-11-25T15:00:00.400Z', NOW)).toBe(1)
  })

  it('no baja de cero cuando ya venció', () => {
    expect(secondsLeft('2026-11-25T14:59:00.000Z', NOW)).toBe(0)
  })

  it('da cero con una fecha que no se puede leer', () => {
    expect(secondsLeft('mañana', NOW)).toBe(0)
  })
})

describe('formatClock', () => {
  it('escribe minutos y segundos con dos cifras', () => {
    expect(formatClock(872)).toBe('14:32')
    expect(formatClock(65)).toBe('01:05')
    expect(formatClock(0)).toBe('00:00')
  })
})

describe('percentLeft', () => {
  it('da la parte de los 15 minutos que queda', () => {
    expect(percentLeft(900)).toBe(100)
    expect(percentLeft(450)).toBe(50)
    expect(percentLeft(0)).toBe(0)
  })

  it('se queda entre 0 y 100', () => {
    expect(percentLeft(1200)).toBe(100)
    expect(percentLeft(-5)).toBe(0)
  })
})

describe('spokenTimeLeft', () => {
  it('habla en minutos, redondeando hacia arriba', () => {
    expect(spokenTimeLeft(900)).toBe('Quedan 15 minutos')
    expect(spokenTimeLeft(61)).toBe('Quedan 2 minutos')
    expect(spokenTimeLeft(60)).toBe('Queda 1 minuto')
  })

  it('avisa el último minuto y el vencimiento', () => {
    expect(spokenTimeLeft(59)).toBe('Queda menos de un minuto')
    expect(spokenTimeLeft(0)).toBe('La reserva venció')
  })
})
