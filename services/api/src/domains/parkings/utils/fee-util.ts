import { FRACTION_MINUTES } from '@domains/parkings/parking-consts'
import type { Rate } from '@domains/parkings/parking-types'

const MINUTES_PER_DAY = 24 * 60

/**
 * Calcula el cobro de una estadía: horas completas × valorHora + fracciones de 15 min ×
 * valorFraccion, con tope de valorDia por cada bloque de 24 h. Una estadía > 0 cobra
 * al menos una fracción.
 */
export const calculateFee = (minutes: number, rate: Rate): number => {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0
  const total = Math.ceil(minutes)
  const days = Math.floor(total / MINUTES_PER_DAY)
  const rest = total % MINUTES_PER_DAY
  const hours = Math.floor(rest / 60)
  const fractions = Math.ceil((rest % 60) / FRACTION_MINUTES)
  const partial = hours * rate.valorHora + fractions * rate.valorFraccion
  return days * rate.valorDia + Math.min(partial, rate.valorDia)
}
