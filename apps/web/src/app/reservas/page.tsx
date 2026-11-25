'use client'

import { RequireSession } from '@app/require-session'
import { MyReservationsScreen } from '@features/reservations/components/my-reservations-screen'

/** Ruta "/reservas": las reservas de quien tiene la sesión. */
export default function MyReservationsPage() {
  return (
    <main>
      <RequireSession>
        <MyReservationsScreen />
      </RequireSession>
    </main>
  )
}
