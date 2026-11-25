import { fetchParking } from '@features/parkings/parking-api'
import { PARKINGS_REFRESH_MS } from '@features/parkings/parking-consts'
import type { Parking } from '@features/parkings/parking-types'
import { useCallback, useEffect, useState } from 'react'

type ParkingState = {
  status: 'loading' | 'ready' | 'not-found' | 'error'
  parking: Parking | null
}

const LOADING: ParkingState = { status: 'loading', parking: null }

const initialState = (initial: Parking | null): ParkingState =>
  initial ? { status: 'ready', parking: initial } : LOADING

/**
 * Un parqueadero con sus cupos al día. Arranca con lo que ya traía la lista, para no mostrar
 * una pantalla de carga, y lo refresca solo mientras la pestaña está visible.
 */
export const useParking = (id: string, initial: Parking | null) => {
  const [state, setState] = useState<ParkingState>(() => initialState(initial))

  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const parking = await fetchParking(id, signal)
        if (signal?.aborted) return
        setState(parking ? { status: 'ready', parking } : { status: 'not-found', parking: null })
      } catch {
        if (signal?.aborted) return
        // Si un refresco falla se conservan los últimos datos que sí llegaron.
        setState((previous) => (previous.parking ? previous : { status: 'error', parking: null }))
      }
    },
    [id],
  )

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(controller.signal)
    }, PARKINGS_REFRESH_MS)

    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [load])

  const reload = useCallback(() => {
    setState(LOADING)
    void load()
  }, [load])

  return { ...state, reload }
}
