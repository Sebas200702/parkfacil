import type { ReactNode } from 'react'
import { Illustration, type IllustrationName } from './illustration'

type EmptyStateProps = {
  illustration: IllustrationName
  /** Nombra la situación, sin disculpas: "Aún no tienes reservas". */
  title: string
  children?: ReactNode
  /** Una sola acción. */
  action?: ReactNode
}

export const EmptyState = ({ illustration, title, children, action }: EmptyStateProps) => (
  <section className="mx-auto grid w-full max-w-80 justify-items-center gap-3 px-4 py-6 text-center">
    <Illustration name={illustration} className="mb-1" />
    <h2 className="text-balance text-heading">{title}</h2>
    {children ? (
      <p className="text-pretty text-[0.9375rem] leading-[1.375rem] text-asphalt-600">{children}</p>
    ) : null}
    {action}
  </section>
)
