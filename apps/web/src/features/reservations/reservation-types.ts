import type { Reserva } from '@lib/types'

/** Contrato de POST /reservas y GET /reservas/mias (docs/api.md). */
export type Reservation = Reserva

/** Por qué no se pudo reservar, en términos de lo que la persona puede hacer después. */
export type ReserveProblem = 'no-capacity' | 'active-reservation' | 'session' | 'connection'

/** Por qué no se pudo cancelar. `not-active`: ya había vencido, se cumplió o se canceló antes. */
export type CancelProblem = 'not-active' | 'session' | 'connection'

export type CancelResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; problem: CancelProblem }

export type ReserveResult =
  | { ok: true; reservation: Reservation }
  | { ok: false; problem: ReserveProblem }
