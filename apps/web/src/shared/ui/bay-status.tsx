import { cx } from '@shared/utils/cx'
import type { ReactNode } from 'react'

export type BayState = 'free' | 'held' | 'taken'

const LABELS: Record<BayState, string> = {
  free: 'Libre',
  held: 'Reservado',
  taken: 'Ocupado',
}

// Vacío, relleno claro y relleno oscuro: el estado se lee también sin color.
const GLYPHS: Record<BayState, string> = {
  free: 'border-status-free',
  held: 'border-status-held-ink bg-status-held',
  taken: 'border-status-taken bg-status-taken',
}

const INKS: Record<BayState, string> = {
  free: 'text-status-free',
  held: 'text-status-held-ink',
  taken: 'text-status-taken',
}

/** Bahía vista desde arriba: tres líneas pintadas, abierta por donde entra el carro. */
export const BayGlyph = ({ state }: { state: BayState }) => (
  <span
    aria-hidden="true"
    className={cx(
      'inline-block h-5 w-3.5 shrink-0 rounded-t-bay border-3 border-b-0',
      GLYPHS[state],
    )}
  />
)

type BayStatusProps = {
  state: BayState
  /** Reemplaza el rótulo por defecto: "Reservado hasta las 3:47 p. m." */
  children?: ReactNode
}

export const BayStatus = ({ state, children }: BayStatusProps) => (
  <span className={cx('inline-flex items-center gap-2 text-label', INKS[state])}>
    <BayGlyph state={state} />
    {children ?? LABELS[state]}
  </span>
)
