import { useHash } from '@shared/hooks/use-hash'
import { AppHeader } from './app-header'
import { UiGallery } from './ui-gallery'
import { WelcomeScreen } from './welcome-screen'

// Mientras no haya router, #ui abre la galería del sistema de diseño.
const GALLERY_HASH = '#ui'

export const App = () => {
  const hash = useHash()

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {hash === GALLERY_HASH ? <UiGallery /> : <WelcomeScreen />}
      </main>
    </div>
  )
}
