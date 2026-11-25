import { Illustration, type IllustrationName } from '@shared/ui/illustration'
import { type LucideIcon, MapPin, Ticket, Timer } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Reveal } from './reveal'

type Step = {
  icon: LucideIcon
  illustration: IllustrationName
  title: string
  text: string
  /** Forma y color de la tarjeta: cada paso tiene la suya. */
  card: string
  art: string
  number: string
  tilt: string
}

// Los pasos sí son una secuencia: buscar, apartar y llegar ocurren en ese orden.
const STEPS: Step[] = [
  {
    icon: MapPin,
    illustration: 'no-location',
    title: 'Mira dónde hay cupo',
    text: 'El mapa marca cada parqueadero con sus cupos libres, para carro y para moto.',
    card: 'items-center rounded-t-[14rem] bg-brand-600 px-7 pt-10 pb-7 text-center text-paper',
    art: 'rounded-full border-3 border-asphalt-950 bg-cream p-3.5',
    number: 'text-paint',
    tilt: '-2.5deg',
  },
  {
    icon: Ticket,
    illustration: 'no-reservations',
    title: 'Aparta el tuyo',
    text: 'Ves la tarifa antes de decidir. Un toque y el cupo queda a tu nombre.',
    card: 'rounded-[0_4.5rem_0_4.5rem] bg-paint p-7 md:-translate-y-6',
    art: 'self-end',
    number: 'text-asphalt-950',
    tilt: '1.5deg',
  },
  {
    icon: Timer,
    illustration: 'expired',
    title: 'Llega en 15 minutos',
    text: 'Un contador te dice cuánto queda. Si no llegas, el cupo se libera solo.',
    card: 'rounded-[0_0_4.5rem_0] bg-asphalt-950 p-7 text-cream',
    art: 'rounded-[50%_50%_0_50%] bg-cream p-4',
    number: 'text-status-free-on-dark',
    tilt: '-1deg',
  },
]

/** Cómo funciona, en tres tarjetas inclinadas que se enderezan al pasar el cursor. */
export const StepsSection = () => (
  <section id="pasos" className="mx-auto w-full max-w-[85rem] px-6 pt-26 pb-20">
    <div className="flex flex-wrap items-end justify-between gap-6">
      <Reveal from="left">
        <h2 className="lp-display lp-drift text-[clamp(2.2rem,6vw,5rem)]">
          Tres
          <br />
          movidas
        </h2>
      </Reveal>
      <Reveal from="right" className="flex flex-wrap items-center gap-5">
        <Illustration name="no-results" className="lp-float h-[9.5rem] w-[13rem]" />
        <p className="lp-mono max-w-[19rem] normal-case">
          / el orden importa: primero miras, luego apartas, luego llegas.
        </p>
      </Reveal>
    </div>

    <ol className="mt-16 grid items-end gap-9 md:grid-cols-3">
      {STEPS.map(({ icon: Icon, illustration, title, text, card, art, number, tilt }, index) => (
        <li key={title}>
          <Reveal delay={index * 140}>
            <article
              style={{ '--lp-tilt': tilt } as CSSProperties}
              className={`lp-card flex flex-col gap-3 border-3 border-asphalt-950 max-md:!rotate-0 ${card}`}
            >
              <Illustration name={illustration} className={`h-[9.5rem] w-[11.5rem] ${art}`} />
              <p
                className={`lp-display flex items-center gap-2.5 text-[3rem] leading-none ${number}`}
              >
                {index + 1}
                <Icon aria-hidden="true" size={34} strokeWidth={2.25} />
              </p>
              <h3 className="lp-heading text-[1.4rem]">{title}</h3>
              <p className="text-[1.05rem] leading-normal">{text}</p>
            </article>
          </Reveal>
        </li>
      ))}
    </ol>
  </section>
)
