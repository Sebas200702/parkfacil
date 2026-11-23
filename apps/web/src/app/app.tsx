import { AuthProvider, useAuth } from '@context/AuthContext'
import { ParkingsScreen } from '@features/parkings/components/parkings-screen'
import { useHash } from '@shared/hooks/use-hash'
import { useCallback, useState } from 'react'
import { AppHeader } from './app-header'
import { LoginScreen } from './login-screen'
import { RegisterScreen } from './register-screen'
import { UiGallery } from './ui-gallery'

const parseRoute = (hash: string): string => {
  const clean = hash.replace(/^#\/?/, '')
  if (clean === 'login') return '/login'
  if (clean === 'registro') return '/registro'
  if (clean === 'ui') return '#ui'

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname.replace(/\/+$/, '')
    if (pathname === '/login') return '/login'
    if (pathname === '/registro') return '/registro'
  }

  return '/'
}

export const AppContent = () => {
  const hash = useHash()
  const [internalRoute, setInternalRoute] = useState<string | null>(null)
  const { isLoading } = useAuth()

  const currentRoute = internalRoute ?? parseRoute(hash)

  const handleNavigate = useCallback((route: string) => {
    setInternalRoute(route)
    if (route === '/') {
      window.location.hash = ''
    } else {
      window.location.hash = route.startsWith('/') ? `#${route}` : route
    }
  }, [])

  return (
    <div className="min-h-dvh">
      <AppHeader onNavigate={handleNavigate} />
      {currentRoute === '/' ? (
        <main>
          <ParkingsScreen />
        </main>
      ) : (
        <main className="mx-auto w-full max-w-3xl px-4 py-6">
          {currentRoute === '#ui' ? (
            <UiGallery />
          ) : currentRoute === '/login' ? (
            <LoginScreen onNavigate={handleNavigate} />
          ) : (
            <RegisterScreen onNavigate={handleNavigate} />
          )}
        </main>
      )}
      {isLoading ? (
        <span className="sr-only" role="status">
          Cargando...
        </span>
      ) : null}
    </div>
  )
}

export const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)
