import { ParkingsScreen } from '@features/parkings/components/parkings-screen'
import { useHash } from '@shared/hooks/use-hash'
import { AppHeader } from './app-header'
import { UiGallery } from './ui-gallery'

// Mientras no haya router, #ui abre la galería del sistema de diseño.
const GALLERY_HASH = '#ui'

export const App = () => {
  const hash = useHash()

  return (
    <div className="min-h-dvh">
      <AppHeader />
      {hash === GALLERY_HASH ? (
        <main className="mx-auto w-full max-w-3xl px-4 py-6">
          <UiGallery />
        </main>
      ) : (
        <main>
          <ParkingsScreen />
        </main>
      )}
    </div>
  )
}
