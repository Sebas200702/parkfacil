import { useEffect, useRef } from 'react'

/**
 * Lleva el foco a un elemento cuando termina una acción (`busy` pasa de true a false).
 * Sirve cuando el botón que se pulsó desaparece al terminar: sin esto el foco se pierde
 * y quien navega con teclado o lector de pantalla vuelve al principio de la página.
 * El elemento debe poder recibir foco: `tabIndex={-1}`.
 */
export const useFocusWhenDone = <T extends HTMLElement>(busy: boolean) => {
  const ref = useRef<T>(null)
  const wasBusy = useRef(busy)

  useEffect(() => {
    if (wasBusy.current && !busy) ref.current?.focus()
    wasBusy.current = busy
  }, [busy])

  return ref
}
