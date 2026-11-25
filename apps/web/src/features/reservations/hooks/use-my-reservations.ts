import { fetchMyReservations } from '@features/reservations/reservation-api'
import type { Reservation } from '@features/reservations/reservation-types'
import { useCallback, useEffect, useState } from 'react'

type MyReservationsState = {
  status: 'loading' | 'ready' | 'error'
  reservations: Reservation[]
}

const LOADING: MyReservationsState = { status: 'loading', reservations: [] }

/**
 * Todas las reservas de la persona, de la más reciente a la más antigua.
 * Al cambiar `revision` (se canceló o venció la activa) las vuelve a pedir.
 */
export const useMyReservations = (revision = '') => {
  const [state, setState] = useState<MyReservationsState>(LOADING)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const reservations = await fetchMyReservations(signal)
      if (!signal?.aborted) setState({ status: 'ready', reservations })
    } catch {
      if (signal?.aborted) return
      // Si un refresco falla se conserva la lista que ya se estaba mostrando.
      setState((previous) =>
        previous.status === 'ready' ? previous : { status: 'error', reservations: [] },
      )
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision solo vuelve a disparar la carga
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load, revision])

  const reload = useCallback(() => {
    setState(LOADING)
    void load()
  }, [load])

  return { ...state, reload }
}
