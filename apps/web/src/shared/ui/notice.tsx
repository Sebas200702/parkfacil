import { cx } from '@shared/utils/cx'
import { CircleAlert, CircleCheck, type LucideIcon, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

export type NoticeTone = 'error' | 'warn' | 'ok'

type ToneStyle = {
  icon: LucideIcon
  box: string
  ink: string
}

// Cada tono tiene un icono de forma distinta: no depende solo del color.
const TONES: Record<NoticeTone, ToneStyle> = {
  error: {
    icon: CircleAlert,
    box: 'border-status-taken bg-status-taken-tint',
    ink: 'text-status-taken',
  },
  warn: {
    icon: TriangleAlert,
    box: 'border-status-held-ink bg-status-held-tint',
    ink: 'text-status-held-ink',
  },
  ok: {
    icon: CircleCheck,
    box: 'border-status-free bg-status-free-tint',
    ink: 'text-status-free',
  },
}

type NoticeProps = {
  tone: NoticeTone
  /** Qué pasó: "Sin cupos". */
  title: string
  /** Qué hacer: "Mira otro parqueadero cerca." */
  children?: ReactNode
}

export const Notice = ({ tone, title, children }: NoticeProps) => {
  const { icon: Icon, box, ink } = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx(
        'animate-rise grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 rounded-plate border-2 px-4 py-3 text-asphalt-950',
        box,
      )}
    >
      <Icon aria-hidden="true" size={20} className={cx('row-span-2 mt-px', ink)} />
      <strong className="font-bold leading-[1.375rem]">{title}</strong>
      {children ? (
        <p className="col-start-2 text-[0.9375rem] leading-[1.375rem]">{children}</p>
      ) : null}
    </div>
  )
}
