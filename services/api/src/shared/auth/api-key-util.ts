import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (value: string) => createHash('sha256').update(value).digest()

/** Compara la API key en tiempo constante. Una clave esperada vacía nunca coincide. */
export const isValidApiKey = (received: string | undefined, expected: string | undefined) => {
  if (!expected || !received) return false
  return timingSafeEqual(digest(received), digest(expected))
}
