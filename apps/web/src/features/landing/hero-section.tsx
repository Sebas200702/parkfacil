import { Illustration } from '@shared/ui/illustration'
import { ArrowRight, Car, Timer } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './reveal'
import { Starburst } from './starburst'

const WORD = 'block text-[clamp(2.6rem,8vw,7rem)]'

/** Portada: el titular de póster, el sello de 15 minutos y el carro en marcha. */
export const HeroSection = () => (
  <section className="relative mx-auto w-full max-w-[85rem] px-6 pt-8">
    <div className="lp-mono flex flex-wrap items-center gap-3.5">
      <span className="lp-blink size-3 rounded-full bg-status-free" />
      <span>Cupos en vivo · Bogotá</span>
      <span aria-hidden="true" className="h-0.5 min-w-10 flex-1 bg-asphalt-950" />
      <Timer aria-hidden="true" size={20} />
      <span>Reserva de 15 minutos</span>
    </div>

    <h1 className="lp-display mt-7 leading-[0.92]">
      <Reveal>
        <span className={WORD}>Llega con</span>
      </Reveal>
      <Reveal delay={120}>
        <span className={`${WORD} text-brand-600`}>el cupo</span>
      </Reveal>
      <Reveal delay={240}>
        <span className={WORD}>apartado</span>
      </Reveal>
    </h1>

    <Reveal
      from="pop"
      delay={400}
      className="max-md:-mt-2 max-md:-mb-10 max-md:relative max-md:z-10 max-md:ml-auto max-md:w-24 md:absolute md:top-24 md:right-[3%] md:w-[clamp(7.5rem,15vw,13rem)]"
    >
      <Starburst label="Sello: 15 minutos" fill="fill-paint" className="block h-auto w-full">
        <text
          x="100"
          y="104"
          textAnchor="middle"
          className="fill-asphalt-950 font-display text-[54px] font-black"
        >
          15
        </text>
        <text
          x="100"
          y="130"
          textAnchor="middle"
          className="fill-asphalt-950 font-code text-[17px] font-bold"
        >
          MINUTOS
        </text>
      </Starburst>
    </Reveal>

    <div className="mt-10 flex flex-wrap items-center justify-between gap-10 max-lg:mt-4 max-lg:gap-6">
      <Reveal delay={300} className="grid max-w-[31rem] flex-[1_1_20rem] gap-5">
        <p className="text-[1.25rem] leading-normal">
          Mira en el mapa qué parqueaderos tienen cupo ahora mismo, aparta el tuyo con un toque y
          llega tranquilo. Si no alcanzas, el cupo se libera solo.
        </p>
        <div className="flex flex-wrap items-center gap-3.5">
          <Link href="/login" className="lp-btn bg-brand-600 text-paper">
            Buscar cupo
            <ArrowRight aria-hidden="true" size={22} />
          </Link>
          <span className="lp-mono lp-float inline-flex items-center gap-2 rounded-[50%] border-2 border-asphalt-950 px-4 py-2.5 normal-case">
            <Car aria-hidden="true" size={20} />
            carro y moto
          </span>
        </div>
      </Reveal>

      <Reveal
        from="right"
        delay={200}
        className="relative flex min-h-[21rem] flex-[1_1_27rem] items-center justify-end max-lg:order-first max-lg:min-h-[17rem] max-lg:basis-full max-lg:justify-center"
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 right-[4%] aspect-square w-[min(78%,25rem)] -translate-y-1/2 rounded-full border-3 border-asphalt-950 bg-brand-600"
        />
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-[6%] size-28 rounded-[7rem_7rem_0_7rem] border-3 border-asphalt-950 bg-paint"
        />
        <span
          aria-hidden="true"
          className="absolute top-[30%] right-[46%] left-0 grid justify-items-end gap-4"
        >
          <span className="lp-streak h-1.5 w-4/5 rounded-full bg-asphalt-950" />
          <span className="lp-streak h-1.5 w-full rounded-full bg-paint [animation-delay:0.3s]" />
          <span className="lp-streak h-1.5 w-3/5 rounded-full bg-asphalt-950 [animation-delay:0.6s]" />
        </span>
        <Illustration name="welcome" className="lp-drive relative h-auto w-[min(100%,32rem)]" />
      </Reveal>
    </div>
  </section>
)
