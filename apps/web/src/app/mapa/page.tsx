'use client'

import { RequireSession } from '@app/require-session'
import { ParkingsScreen } from '@features/parkings/components/parkings-screen'

/** Ruta "/mapa": el mapa de parqueaderos. Solo para quien tiene sesión. */
export default function MapPage() {
  return (
    <main>
      <RequireSession>
        <ParkingsScreen />
      </RequireSession>
    </main>
  )
}
