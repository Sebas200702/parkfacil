import { useAuth } from '@context/AuthContext'
import { isAdminUser } from '@lib/token'
import { Button } from '@shared/ui/button'
import { LogIn, LogOut, Shield, Ticket, UserPlus } from 'lucide-react'
import type { MouseEvent } from 'react'

/** Marca: una bahía con el cupo apartado en violeta. Mismo dibujo que public/favicon.svg. */
const BrandMark = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    className="size-8 shrink-0 transition-transform duration-300 ease-soft group-hover:-rotate-6 group-hover:scale-105"
  >
    <rect width="32" height="32" rx="6" className="fill-asphalt-950" />
    <rect x="11.5" y="10.5" width="9" height="16" className="fill-brand-600" />
    <path
      d="M8.5 27V7.5h15V27"
      fill="none"
      strokeWidth="3"
      strokeLinejoin="round"
      className="stroke-paper"
    />
  </svg>
)

const LINK_FOCUS =
  'rounded-plate focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-paint'

export interface AppHeaderProps {
  onNavigate?: (route: string) => void
}

export const AppHeader = ({ onNavigate }: AppHeaderProps) => {
  const { idToken, isAuthenticated, logout } = useAuth()
  const isAdmin = isAdminUser(idToken)
  // Con sesión, el inicio es el mapa: ir a la landing y rebotar al mapa se vería como un parpadeo.
  const homeRoute = isAuthenticated ? '/mapa' : '/'

  const handleBrandClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(homeRoute)
    }
  }

  return (
    <header className="bg-asphalt-950 text-paper">
      <div className="flex h-14 w-full items-center justify-between gap-2 px-3 sm:px-4">
        <a
          href={homeRoute}
          onClick={handleBrandClick}
          className={`group inline-flex min-w-0 items-center gap-2.5 ${LINK_FOCUS}`}
        >
          <BrandMark />
          <span className="truncate text-heading font-extrabold tracking-tight">ParkFácil</span>
        </a>

        <nav
          aria-label="Navegación de usuario"
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
          {process.env.NODE_ENV === 'development' ? (
            <a
              href="/ui/"
              className={`hidden whitespace-nowrap text-label underline underline-offset-4 md:inline ${LINK_FOCUS}`}
            >
              Sistema de diseño
            </a>
          ) : null}

          {isAdmin ? (
            <Button
              variant="secondary"
              icon={Shield}
              onClick={() => onNavigate?.('/admin')}
              className="h-9 min-h-9 px-2.5 text-sm sm:px-3 text-asphalt-950"
            >
              <span className="max-sm:sr-only">Administración</span>
            </Button>
          ) : null}

          {isAuthenticated ? (
            <Button
              variant="quiet"
              icon={Ticket}
              onClick={() => onNavigate?.('/reservas')}
              className="h-9 min-h-9 px-2.5 text-paper hover:text-concrete-200 sm:px-3"
            >
              <span className="max-sm:sr-only">Mis reservas</span>
            </Button>
          ) : null}

          {isAuthenticated ? (
            <Button
              variant="secondary"
              icon={LogOut}
              onClick={logout}
              className="h-9 min-h-9 px-2.5 text-sm sm:px-3"
            >
              <span className="max-sm:sr-only">Cerrar sesión</span>
            </Button>
          ) : (
            <>
              <Button
                variant="quiet"
                icon={LogIn}
                onClick={() => onNavigate?.('/login')}
                className="h-9 min-h-9 px-2.5 text-paper hover:text-concrete-200 sm:px-3"
              >
                <span className="max-sm:sr-only">Iniciar sesión</span>
              </Button>
              <Button
                variant="primary"
                icon={UserPlus}
                onClick={() => onNavigate?.('/registro')}
                className="h-9 min-h-9 px-2.5 text-sm sm:px-3"
              >
                <span className="max-sm:sr-only">Registrarse</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
