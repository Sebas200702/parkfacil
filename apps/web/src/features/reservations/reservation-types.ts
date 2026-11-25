import type { Reserva } from '@lib/types'

/** Contrato de POST /reservas y GET /reservas/mias (docs/api.md). */
export type Reservation = Reserva

/** Por qué no se pudo reservar, en términos de lo que la persona puede hacer después. */
export type ReserveProblem = 'no-capacity' | 'active-reservation' | 'session' | 'connection'

export type ReserveResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; problem: ReserveProblem }
