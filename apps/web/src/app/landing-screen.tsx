'use client'

import '@features/landing/landing.css'
import '@features/landing/landing-motion.css'
import { useAuth } from '@context/AuthContext'
import { CtaSection } from '@features/landing/cta-section'
import { HeroSection } from '@features/landing/hero-section'
import { LandingFooter } from '@features/landing/landing-footer'
import { LandingNav } from '@features/landing/landing-nav'
import { PlanSection } from '@features/landing/plan-section'
import { StepsSection } from '@features/landing/steps-section'
import { TicketSection } from '@features/landing/ticket-section'
import { useNavigate } from '@shared/hooks/use-navigate'
import { useEffect } from 'react'

const MARQUEE = 'MIRA EL MAPA ✦ APARTA TU CUPO ✦ LLEGA EN 15 MINUTOS ✦ '

/** Cinta amarilla que corre sin parar entre la portada y el plano. Se detiene al pasar el cursor. */
const Marquee = () => (
  <div
    aria-hidden="true"
    className="lp-marquee-wrap lp-display mt-16 -rotate-[1.5deg] scale-[1.04] overflow-hidden whitespace-nowrap border-asphalt-950 border-y-3 bg-paint py-4 text-[1.5rem] leading-none tracking-tight"
  >
    <div className="lp-marquee">
      <span className="pr-8">{MARQUEE.repeat(3)}</span>
      <span className="pr-8">{MARQUEE.repeat(3)}</span>
    </div>
  </div>
)

/** Landing pública: qué es ParkFácil y por dónde se entra. */
export const LandingScreen = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Quien ya tiene sesión (o vuelve de iniciar con Google) va directo al mapa.
  useEffect(() => {
    if (isAuthenticated) navigate('/mapa')
  }, [isAuthenticated, navigate])

  return (
    <div className="overflow-hidden bg-cream">
      <LandingNav />
      <main>
        <HeroSection />
        <Marquee />
        <PlanSection />
        <StepsSection />
        <TicketSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
