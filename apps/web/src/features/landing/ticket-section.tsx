'use client'

import { Ticket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Reveal } from './reveal'

const TOTAL_SECONDS = 15 * 60
const START_SECONDS = 14 * 60 + 32

const twoDigits = (value: number) => String(value).padStart(2, '0')

/** Contador de demostración: baja cada segundo y vuelve a empezar al llegar a cero. */
const useDemoCountdown = () => {
  const [left, setLeft] = useState(START_SECONDS)

  useEffect(() => {
    const timer = window.setInterval(
      () => setLeft((current) => (current > 0 ? current - 1 : TOTAL_SECONDS)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [])

  return {
    clock: `${twoDigits(Math.floor(left / 60))}:${twoDigits(left % 60)}`,
    percent: Math.round((left / TOTAL_SECONDS) * 100),
  }
}

/** El tiquete: así se ve una reserva con su cuenta regresiva. */
export const TicketSection = () => {
  const { clock, percent } = useDemoCountdown()

  return (
    <section id="tiquete" className="mx-auto w-full max-w-[85rem] px-6 pt-18 pb-26">
      <Reveal from="pop">
        <div className="flex -rotate-1 flex-wrap overflow-hidden rounded-[1.75rem] border-3 border-asphalt-950 bg-paper shadow-[10px_10px_0_var(--color-brand-600)] max-md:rotate-0">
          <div className="flex flex-[1_1_19rem] flex-col justify-between gap-3 bg-asphalt-950 p-8 text-cream">
            <span className="lp-mono inline-flex items-center gap-2 text-paint">
              <Ticket aria-hidden="true" size={20} />
              Tiquete · carro · B-14
            </span>
            {/* El reloj de ejemplo es decorativo: no se anuncia cada segundo. */}
            <span
              aria-hidden="true"
              className="font-code text-[clamp(3.5rem,8vw,6.5rem)] font-bold leading-none tracking-tighter tabular-nums"
            >
              {clock}
            </span>
            <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-asphalt-800">
              <span
                className="block h-full rounded-full bg-paint transition-[width] duration-1000 ease-linear"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="lp-mono">Tu cupo está apartado</span>
          </div>
          <div className="grid flex-[2_1_24rem] content-center gap-4 border-asphalt-950 border-dashed p-8 md:border-l-3">
            <h2 className="lp-heading text-[clamp(1.6rem,2.8vw,2.5rem)]">
              Tu reserva es un tiquete con cuenta regresiva
            </h2>
            <p className="max-w-[32rem] text-[1.1rem] leading-relaxed">
              Sabes qué espacio te toca y cuánto tiempo te queda. Si cambias de plan, la cancelas y
              el cupo vuelve a quedar libre para otro.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
