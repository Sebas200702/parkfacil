import { EmptyState } from '@shared/ui/empty-state'

export interface WelcomeScreenProps {
  onNavigate?: (route: string) => void
  isAuthenticated?: boolean
}

export const WelcomeScreen = ({ isAuthenticated }: WelcomeScreenProps) => (
  <div className="grid gap-6 pt-6">
    <EmptyState
      illustration="welcome"
      title={isAuthenticated ? '¡Bienvenido a ParkFácil!' : 'Aparta tu cupo antes de llegar'}
    >
      {isAuthenticated
        ? 'Explora los parqueaderos disponibles y gestiona tus reservas activas en tiempo real.'
        : 'Aquí vas a ver los parqueaderos cerca, sus cupos en vivo y tu reserva de 15 minutos.'}
    </EmptyState>
    {import.meta.env.DEV ? (
      <p className="text-center text-caption text-asphalt-600">
        <a
          href="#ui"
          className="font-semibold text-brand-600 underline decoration-2 underline-offset-4"
        >
          Ver el sistema de diseño
        </a>
      </p>
    ) : null}
  </div>
)
