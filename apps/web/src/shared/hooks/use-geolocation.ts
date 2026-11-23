import type { GeoPoint } from '@shared/utils/geo-util'
import { useCallback, useState } from 'react'

type GeolocationState = {
  status: 'idle' | 'locating' | 'ready' | 'denied'
  position: GeoPoint | null
}

const IDLE: GeolocationState = { status: 'idle', position: null }
const DENIED: GeolocationState = { status: 'denied', position: null }

/** Ubicación del navegador. Solo se pide cuando la persona pulsa "Mi ubicación". */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(IDLE)

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState(DENIED)
      return
    }

    setState((previous) => ({ ...previous, status: 'locating' }))
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setState({ status: 'ready', position: { lat: coords.latitude, lng: coords.longitude } }),
      () => setState(DENIED),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }, [])

  return { ...state, locate }
}
