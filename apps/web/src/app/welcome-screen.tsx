import { EmptyState } from '@shared/ui/empty-state'

export const WelcomeScreen = () => (
  <div className="pt-6">
    <EmptyState illustration="welcome" title="Aparta tu cupo antes de llegar">
      Aquí vas a ver los parqueaderos cerca, sus cupos en vivo y tu reserva de 15 minutos.
    </EmptyState>
  </div>
)
