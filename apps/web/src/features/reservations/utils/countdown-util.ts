import { RESERVATION_SECONDS } from '@features/reservations/reservation-consts'

/** Segundos que faltan para `expiresAt` (fecha ISO). Nunca baja de cero. */
export const secondsLeft = (expiresAt: string, now: number): number => {
  const ms = Date.parse(expiresAt) - now
  return Number.isFinite(ms) ? Math.max(0, Math.ceil(ms / 1000)) : 0
}

const twoDigits = (value: number): string => String(value).padStart(2, '0')

/** 872 → "14:32". */
export const formatClock = (seconds: number): string =>
  `${twoDigits(Math.floor(seconds / 60))}:${twoDigits(seconds % 60)}`

/** Parte del tiempo que queda, de 0 a 100, para la barra del tiquete. */
export const percentLeft = (seconds: number): number =>
  Math.min(100, Math.max(0, Math.round((seconds / RESERVATION_SECONDS) * 100)))

/** Frase para lectores de pantalla; se anuncia por minuto, no por segundo. */
export const spokenTimeLeft = (seconds: number): string => {
  if (seconds <= 0) return 'La reserva venció'
  if (seconds < 60) return 'Queda menos de un minuto'
  const minutes = Math.ceil(seconds / 60)
  return minutes === 1 ? 'Queda 1 minuto' : `Quedan ${minutes} minutos`
}
