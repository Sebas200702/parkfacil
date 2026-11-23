import { AuthProvider, useAuth } from '@context/AuthContext'
import { useHash } from '@shared/hooks/use-hash'
import { useCallback, useState } from 'react'
import { AppHeader } from './app-header'
import { LoginScreen } from './login-screen'
import { RegisterScreen } from './register-screen'
import { UiGallery } from './ui-gallery'
import { WelcomeScreen } from './welcome-screen'

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
  const { isAuthenticated, isLoading } = useAuth()

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
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {currentRoute === '#ui' ? (
          <UiGallery />
        ) : currentRoute === '/login' ? (
          <LoginScreen onNavigate={handleNavigate} />
        ) : currentRoute === '/registro' ? (
          <RegisterScreen onNavigate={handleNavigate} />
        ) : (
          <WelcomeScreen onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />
        )}
        {isLoading ? (
          <span className="sr-only" role="status">
            Cargando...
          </span>
        ) : null}
      </main>
    </div>
  )
}

export const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)
