import { Illustration } from '@shared/ui/illustration'
import { ArrowRight, LogIn } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './reveal'

/** Cierre: la invitación a entrar, con el titular y la ilustración lado a lado. */
export const CtaSection = () => (
  <section
    id="entrar"
    className="relative overflow-hidden border-asphalt-950 border-t-3 bg-brand-600 px-6 py-20 text-paper"
  >
    <span
      aria-hidden="true"
      className="absolute -top-24 -right-24 size-80 rounded-full border-3 border-paint"
    />
    <span
      aria-hidden="true"
      className="absolute top-8 right-8 size-80 rounded-full border-3 border-paint"
    />

    <div className="relative mx-auto flex w-full max-w-[85rem] flex-wrap items-center justify-between gap-10">
      <div className="grid flex-[3_1_28rem] gap-8">
        <Reveal from="left">
          <h2 className="lp-display lp-drift text-[clamp(2.6rem,8vw,7rem)]">
            Deja de
            <br />
            <span className="text-paint">dar vueltas</span>
          </h2>
        </Reveal>
        <Reveal delay={150} className="flex flex-wrap items-center gap-3.5">
          <Link href="/registro" className="lp-btn bg-paint text-asphalt-950">
            Crear cuenta
            <ArrowRight aria-hidden="true" size={22} />
          </Link>
          <Link
            href="/login"
            className="lp-btn border-paper bg-transparent text-paper [--lp-shadow:var(--color-brand-700)]"
          >
            <LogIn aria-hidden="true" size={22} />
            Iniciar sesión
          </Link>
        </Reveal>
      </div>

      <Reveal from="right" delay={100} className="flex-[2_1_20rem]">
        <Illustration
          name="road"
          className="lp-float ml-auto h-auto w-[min(100%,26rem)] rounded-[1.75rem_1.75rem_1.75rem_8.75rem] border-3 border-asphalt-950 bg-cream p-5"
        />
      </Reveal>
    </div>
  </section>
)
