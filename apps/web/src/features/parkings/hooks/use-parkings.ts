import { fetchParkings } from '@features/parkings/parking-api'
import { PARKINGS_REFRESH_MS } from '@features/parkings/parking-consts'
import type { Parking } from '@features/parkings/parking-types'
import { useCallback, useEffect, useState } from 'react'

type ParkingsState = {
  status: 'loading' | 'ready' | 'error'
  parkings: Parking[]
}

const LOADING: ParkingsState = { status: 'loading', parkings: [] }

/**
 * Parqueaderos con sus cupos; se refrescan solos mientras la pestaña está visible.
 * Al cambiar `revision` (por ejemplo, tras reservar) vuelve a pedirlos de inmediato.
 */
export const useParkings = (revision = '') => {
  const [state, setState] = useState<ParkingsState>(LOADING)

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const parkings = await fetchParkings(signal)
      setState({ status: 'ready', parkings })
    } catch {
      if (signal?.aborted) return
      // Si un refresco falla se conservan los últimos cupos que sí llegaron.
      setState((previous) =>
        previous.status === 'ready' ? previous : { status: 'error', parkings: [] },
      )
    }
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision solo vuelve a disparar la carga
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
  }, [load, revision])

  const reload = useCallback(() => {
    setState(LOADING)
    void load()
  }, [load])

  return { ...state, reload }
}
