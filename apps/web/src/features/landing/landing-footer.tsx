import { CarTop, MotoTop } from '@shared/ui/bay-map'
import { Illustration } from '@shared/ui/illustration'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './reveal'
import { Starburst } from './starburst'

const COLUMN = 'grid content-start justify-items-start gap-1 text-[0.9rem]'
const COLUMN_TITLE = 'lp-mono text-[0.8rem] font-bold text-paint'

/** Carretera animada: un carro y una moto cruzan el pie de página. */
const Road = () => (
  <div
    aria-hidden="true"
    className="relative h-14 overflow-hidden border-cream border-b-3 bg-asphalt-800"
  >
    <span className="lp-road absolute top-1/2 left-0 -mt-[3px] h-1.5 w-[300%] bg-[repeating-linear-gradient(90deg,var(--color-paint)_0_44px,transparent_44px_88px)]" />
    <span className="lp-cross absolute top-[-1.5rem] left-0 text-brand-400">
      <span className="block rotate-90">
        <CarTop compact={false} />
      </span>
    </span>
    <span className="lp-cross absolute bottom-[-0.5rem] left-0 text-status-taken-on-dark [animation-delay:-4.5s]">
      <span className="block rotate-90">
        <MotoTop compact />
      </span>
    </span>
  </div>
)

export const LandingFooter = () => (
  <footer className="bg-asphalt-950 text-cream">
    <Road />
    <div className="mx-auto grid w-full max-w-[85rem] gap-6 px-6 pt-7 pb-4">
      <Reveal from="pop">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[1.5rem] border-3 border-cream bg-paint px-4 py-3 md:py-2 md:pr-5 md:pl-2 text-asphalt-950 md:rounded-[999px_1.75rem_1.75rem_999px]">
          <Illustration
            name="ride"
            className="lp-float h-[4.5rem] w-[6rem] rounded-full border-3 border-asphalt-950 bg-cream p-2.5 max-sm:hidden"
          />
          <p className="lp-heading flex-[1_1_14rem] text-[clamp(1.05rem,1.8vw,1.4rem)]">
            Tu cupo te espera. Tú solo llega.
          </p>
          <Link
            href="/login"
            className="lp-btn bg-asphalt-950 text-cream [--lp-shadow:var(--color-brand-600)]"
          >
            Buscar cupo
            <ArrowRight aria-hidden="true" size={22} />
          </Link>
          <Starburst fill="fill-brand-600" className="size-[3.5rem] flex-none max-sm:hidden">
            <text
              x="100"
              y="128"
              textAnchor="middle"
              className="fill-paper font-display text-[84px] font-black"
            >
              P
            </text>
          </Starburst>
        </div>
      </Reveal>

      <Reveal className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-2 grid max-w-[26rem] content-start gap-2 md:col-span-1">
          <p className="font-display text-[1.1rem] font-black tracking-tight">PARKFÁCIL</p>
          <p className="text-[0.9rem] leading-normal text-concrete-300">
            Cupos de parqueadero en vivo y reservas de 15 minutos. Proyecto del curso Buenas
            Prácticas de Desarrollo de Software.
          </p>
        </div>
        <nav aria-label="Producto" className={COLUMN}>
          <span className={COLUMN_TITLE}>/ Producto</span>
          <a href="#plano" className="lp-link">
            El plano
          </a>
          <a href="#pasos" className="lp-link">
            Cómo funciona
          </a>
          <a href="#tiquete" className="lp-link">
            El tiquete
          </a>
        </nav>
        <nav aria-label="Cuenta" className={COLUMN}>
          <span className={COLUMN_TITLE}>/ Cuenta</span>
          <Link href="/login" className="lp-link">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="lp-link">
            Crear cuenta
          </Link>
          <Link href="/admin" className="lp-link">
            Panel de administrador
          </Link>
        </nav>
        <nav aria-label="Proyecto" className={`${COLUMN} max-md:col-span-2`}>
          <span className={COLUMN_TITLE}>/ Proyecto</span>
          <a
            href="https://github.com/Sebas200702/parkfacil"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-link inline-flex items-center gap-2"
          >
            Código en GitHub
            <ArrowUpRight aria-hidden="true" size={16} />
          </a>
          <span className="py-1 text-concrete-300">Mapas: © OpenStreetMap</span>
          <span className="py-1 text-concrete-300">Ilustraciones: unDraw</span>
        </nav>
      </Reveal>

      <div className="lp-mono flex flex-wrap justify-between gap-4 border-asphalt-800 border-t-2 pt-3 text-[0.75rem] text-concrete-300">
        <span>© 2026 ParkFácil · Bogotá, Colombia</span>
        <span className="inline-flex items-center gap-2">
          <span className="lp-blink size-2.5 rounded-full bg-status-free-on-dark" />
          Cupos en vivo
        </span>
      </div>
    </div>
  </footer>
)
