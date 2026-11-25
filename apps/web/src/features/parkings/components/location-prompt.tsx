import { Button } from '@shared/ui/button'
import { EmptyState } from '@shared/ui/empty-state'
import { LocateFixed } from 'lucide-react'

type LocationPromptProps = {
  status: 'idle' | 'locating' | 'ready' | 'denied'
  onLocate: () => void
}

/**
 * Invitación a compartir la ubicación, al final de la lista de parqueaderos.
 * Desaparece cuando ya sabemos dónde está la persona.
 */
export const LocationPrompt = ({ status, onLocate }: LocationPromptProps) => {
  if (status === 'ready') return null

  const denied = status === 'denied'

  return (
    <EmptyState
      illustration="no-location"
      title={denied ? 'No pudimos ubicarte' : '¿Cuál te queda más cerca?'}
      action={
        <Button
          variant="secondary"
          icon={LocateFixed}
          loading={status === 'locating'}
          loadingLabel="Ubicando"
          onClick={onLocate}
        >
          {denied ? 'Intentar de nuevo' : 'Usar mi ubicación'}
        </Button>
      }
    >
      {denied
        ? 'Activa la ubicación en tu navegador y vuelve a intentar.'
        : 'Comparte tu ubicación y ordenamos la lista por distancia.'}
    </EmptyState>
  )
}
