import { secondsLeft } from '@features/reservations/utils/countdown-util'
import { useEffect, useState } from 'react'

/**
 * Segundos que le quedan a una reserva. Se calcula contra el reloj en cada tic, no restando
 * de uno en uno: así no se atrasa si el navegador pausa la pestaña.
 */
export const useCountdown = (expiresAt: string): number => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return secondsLeft(expiresAt, now)
}
