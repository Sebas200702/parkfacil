'use client'

import { cx } from '@shared/utils/cx'
import { type ReactNode, useEffect, useRef, useState } from 'react'

type RevealProps = {
  children: ReactNode
  /** Desde dónde entra el bloque. */
  from?: 'up' | 'left' | 'right' | 'pop'
  /** Retraso en milisegundos, para escalonar bloques vecinos. */
  delay?: number
  className?: string
}

/**
 * Hace aparecer su contenido cuando entra en pantalla al hacer scroll.
 * Si el navegador no tiene IntersectionObserver, el contenido se muestra de una vez.
 */
export const Reveal = ({ children, from = 'up', delay = 0, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-from={from}
      data-shown={shown}
      className={cx('lp-reveal', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
