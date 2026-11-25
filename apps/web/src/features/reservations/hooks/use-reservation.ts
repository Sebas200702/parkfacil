import type { VehicleType } from '@features/parkings/parking-types'
import {
  cancelReservation,
  createReservation,
  fetchMyReservations,
} from '@features/reservations/reservation-api'
import { RESERVATION_REFRESH_MS } from '@features/reservations/reservation-consts'
import type {
  CancelProblem,
  Reservation,
  ReserveProblem,
} from '@features/reservations/reservation-types'
import { useCallback, useEffect, useState } from 'react'

type EndKind = 'expired' | 'arrived' | 'cancelled'

/** Lo último que pasó con la reserva y en qué parqueadero, para explicarlo en su detalle. */
export type ReservationNotice = {
  kind: ReserveProblem | EndKind
  parkingId: string
}

type ReservationState = {
  reservation: Reservation | null
  notice: ReservationNotice | null
  reserving: boolean
  cancelling: boolean
  /** Por qué falló el último intento de cancelar; la reserva sigue activa. */
  cancelProblem: Exclude<CancelProblem, 'not-active'> | null
}

const EMPTY: ReservationState = {
  reservation: null,
  notice: null,
  reserving: false,
  cancelling: false,
  cancelProblem: null,
}

const isLive = (reservation: Reservation): boolean =>
  reservation.estado === 'ACTIVA' && Date.parse(reservation.venceEn) > Date.now()

const ended = (reservation: Reservation, kind: EndKind): ReservationState => ({
  ...EMPTY,
  notice: { kind, parkingId: reservation.parqueaderoId },
})

/** Cómo queda el estado según lo que la API dice ahora de la reserva que se venía mostrando. */
const reconcile = (state: ReservationState, mine: Reservation[]): ReservationState => {
  const live = mine.find(isLive)
  if (live) return { ...state, reservation: live }

  const shown = state.reservation
  if (!shown) return state
  const latest = mine.find((reservation) => reservation.id === shown.id)
  if (latest?.estado === 'CUMPLIDA') return ended(shown, 'arrived')
  if (latest?.estado === 'CANCELADA') return ended(shown, 'cancelled')
  return ended(shown, 'expired')
}

/**
 * La reserva activa de la persona (solo puede tener una). La recupera al entrar, así el contador
 * sobrevive a recargar la página, y la suelta cuando vence, se cumple o se cancela.
 */
export const useReservation = () => {
  const [state, setState] = useState<ReservationState>(EMPTY)
  const { reservation } = state

  const sync = useCallback(async (signal?: AbortSignal) => {
    try {
      const mine = await fetchMyReservations(signal)
      if (!signal?.aborted) setState((previous) => reconcile(previous, mine))
    } catch {
      // Si no se pudo consultar, se conserva lo último que se sabía.
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void sync(controller.signal)
    return () => controller.abort()
  }, [sync])

  const reservationId = reservation?.id
  const expiresAt = reservation?.venceEn

  // Mientras hay reserva: se confirma con la API cada tanto y se suelta justo al vencer.
  useEffect(() => {
    if (!reservationId || !expiresAt) return
    const controller = new AbortController()

    const poll = window.setInterval(() => {
      if (document.visibilityState === 'visible') void sync(controller.signal)
    }, RESERVATION_REFRESH_MS)
    const expiry = window.setTimeout(
      () =>
        setState((previous) =>
          previous.reservation?.id === reservationId
            ? ended(previous.reservation, 'expired')
            : previous,
        ),
      Math.max(0, Date.parse(expiresAt) - Date.now()),
    )

    return () => {
      controller.abort()
      window.clearInterval(poll)
      window.clearTimeout(expiry)
    }
  }, [reservationId, expiresAt, sync])

  const reserve = useCallback(
    async (parkingId: string, vehicle: VehicleType) => {
      setState((previous) => ({ ...previous, notice: null, reserving: true }))
      const result = await createReservation(parkingId, vehicle)

      if (result.ok) {
        setState({ ...EMPTY, reservation: result.reservation })
        return
      }
      setState((previous) => ({
        ...previous,
        notice: { kind: result.problem, parkingId },
        reserving: false,
      }))
      // Si ya había una reserva (hecha en otra pestaña o dispositivo), se trae para mostrarla.
      if (result.problem === 'active-reservation') void sync()
    },
    [sync],
  )

  const cancel = useCallback(async () => {
    if (!reservation) return
    setState((previous) => ({ ...previous, cancelling: true, cancelProblem: null }))
    const result = await cancelReservation(reservation.id)

    if (result.ok) {
      setState(ended(reservation, 'cancelled'))
      return
    }
    const { problem } = result
    if (problem === 'not-active') {
      // Ya no estaba activa: la API dice si venció, se cumplió o se canceló en otro lado.
      setState((previous) => ({ ...previous, cancelling: false }))
      await sync()
      return
    }
    setState((previous) => ({ ...previous, cancelling: false, cancelProblem: problem }))
  }, [reservation, sync])

  return { ...state, reserve, cancel }
}

export type ReservationController = ReturnType<typeof useReservation>
