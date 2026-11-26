import { ButtonLink } from '@shared/ui/button-link'
import { EmptyState } from '@shared/ui/empty-state'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Página no encontrada' }

/** Página 404. La exportación estática la deja en out/404.html. */
export default function NotFound() {
  return (
    <main className="px-4 py-10">
      <EmptyState
        illustration="no-results"
        title="Esta página no existe"
        action={
          <ButtonLink href="/" variant="primary">
            Ir al inicio
          </ButtonLink>
        }
      >
        Puede que el enlace esté mal escrito o que la página se haya movido.
      </EmptyState>
    </main>
  )
}
