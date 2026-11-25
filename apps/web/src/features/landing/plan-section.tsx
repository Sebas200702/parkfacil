import { BayMap, type BayMapItem } from '@shared/ui/bay-map'
import { Illustration } from '@shared/ui/illustration'
import { MapPin } from 'lucide-react'
import { Reveal } from './reveal'

// Doce bahías de ejemplo: cinco carros, dos motos y cinco libres.
// La tercera es el carro que entra y sale en la animación.
const SAMPLE: ReadonlyArray<Pick<BayMapItem, 'state' | 'vehicle'>> = [
  { state: 'taken', vehicle: 'car' },
  { state: 'taken', vehicle: 'car' },
  { state: 'taken', vehicle: 'car' },
  { state: 'free' },
  { state: 'taken', vehicle: 'moto' },
  { state: 'taken', vehicle: 'car' },
  { state: 'free' },
  { state: 'free' },
  { state: 'taken', vehicle: 'moto' },
  { state: 'free' },
  { state: 'taken', vehicle: 'car' },
  { state: 'free' },
]

const BAYS: BayMapItem[] = SAMPLE.map((bay, index) => ({ ...bay, id: `bay-${index}` }))

const LEGEND = [
  {
    label: 'Libre',
    border: 'border-status-free-on-dark',
    swatch: 'border-3 border-b-0 border-status-free-on-dark',
  },
  { label: 'Reservado', border: 'border-paint', swatch: 'bg-paint' },
  { label: 'Ocupado', border: 'border-status-taken-on-dark', swatch: 'bg-status-taken-on-dark' },
]

/** El plano: un parqueadero visto desde arriba, con carros y motos en sus bahías. */
export const PlanSection = () => (
  <section id="plano" className="-mt-2 bg-asphalt-950 px-6 pt-26 pb-24 text-cream">
    <div className="mx-auto flex w-full max-w-[85rem] flex-wrap items-stretch gap-12">
      <Reveal from="left" className="max-md:w-full">
        <p className="lp-display text-[clamp(2.2rem,5vw,4.5rem)] text-paint md:[writing-mode:vertical-rl] md:rotate-180">
          El plano
        </p>
      </Reveal>

      <Reveal className="relative min-w-0 flex-[3_1_30rem]">
        <div className="rounded-[1.75rem_1.75rem_0_1.75rem] border-3 border-cream p-5">
          <div className="lp-mono mb-4 flex flex-wrap justify-between gap-3">
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden="true" size={20} />
              Parque 93 · carros y motos
            </span>
            <span className="text-status-free-on-dark">5 libres de 12</span>
          </div>
          <div className="lp-plan">
            <BayMap
              summary
              label="Plano de ejemplo: cinco carros y dos motos estacionados, cinco bahías libres"
              bays={BAYS}
            />
          </div>
        </div>
        <span className="lp-mono absolute -right-3 -bottom-5 -rotate-[5deg] rounded-full border-2 border-cream bg-brand-600 px-4 py-2.5 font-bold text-paper">
          vista desde arriba
        </span>
      </Reveal>

      <Reveal from="right" delay={150} className="grid flex-[2_1_19rem] content-center gap-5">
        <Illustration
          name="navigation"
          className="lp-float h-[10.5rem] w-[14.5rem] rounded-[7.5rem_7.5rem_1.5rem_1.5rem] border-3 border-paint bg-cream px-4 pt-4 pb-2"
        />
        <h2 className="lp-heading text-[clamp(1.6rem,2.6vw,2.4rem)]">
          Una bahía vacía es un cupo libre
        </h2>
        <p className="text-[1.1rem] leading-relaxed text-concrete-300">
          Cada parqueadero se dibuja como lo verías desde un dron, con carros y motos en su sitio.
          Los sensores avisan cuando alguno entra o sale y el dibujo cambia solo.
        </p>
        <ul className="lp-mono flex flex-wrap gap-2.5">
          {LEGEND.map(({ label, border, swatch }) => (
            <li
              key={label}
              className={`inline-flex items-center gap-2.5 rounded-full border-2 px-3.5 py-2 ${border}`}
            >
              <span aria-hidden="true" className={`h-5 w-3.5 ${swatch}`} />
              {label}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  </section>
)
