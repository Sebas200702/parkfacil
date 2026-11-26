import type { ReservationController } from '@features/reservations/hooks/use-reservation'
import { Button } from '@shared/ui/button'
import { Notice } from '@shared/ui/notice'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type CancelReservationProps = Pick<ReservationController, 'cancel' | 'cancelling' | 'cancelProblem'>

const PROBLEMS = {
  session: { title: 'Tu sesión venció', body: 'Vuelve a entrar para cancelar la reserva.' },
  connection: { title: 'No pudimos cancelar', body: 'Tu reserva sigue activa. Intenta de nuevo.' },
} as const

/**
 * Cancelar la reserva activa. Pide confirmar antes: cancelar libera el cupo y no se puede deshacer.
 */
export const CancelReservation = ({
  cancel,
  cancelling,
  cancelProblem,
}: CancelReservationProps) => {
  const [confirming, setConfirming] = useState(false)
  const asking = confirming || cancelling
  const boxRef = useRef<HTMLDivElement & HTMLFieldSetElement>(null)
  const wasAsking = useRef(asking)
  const problem = cancelProblem ? PROBLEMS[cancelProblem] : null

  // Al abrir o cerrar la pregunta, el botón pulsado desaparece: el foco pasa a este bloque
  // para que teclado y lector de pantalla sigan aquí y oigan la pregunta.
  useEffect(() => {
    if (wasAsking.current !== asking) boxRef.current?.focus()
    wasAsking.current = asking
  }, [asking])

  if (!asking) {
    return (
      <div ref={boxRef} tabIndex={-1} className="grid gap-3 outline-none">
        {problem ? (
          <Notice tone="error" title={problem.title}>
            {problem.body}
          </Notice>
        ) : null}
        <Button variant="danger" icon={X} block onClick={() => setConfirming(true)}>
          Cancelar reserva
        </Button>
      </div>
    )
  }

  return (
    <fieldset
      ref={boxRef}
      tabIndex={-1}
      aria-describedby="cancel-consequence"
      className="grid gap-3 rounded-plate border-2 border-status-taken p-4 outline-none"
    >
      <legend className="px-1 font-bold">¿Cancelar la reserva?</legend>
      <p id="cancel-consequence" className="text-[0.9375rem] leading-[1.375rem] text-asphalt-600">
        El cupo queda libre para otra persona. No se puede deshacer.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" disabled={cancelling} onClick={() => setConfirming(false)}>
          No, conservar
        </Button>
        <Button
          variant="danger"
          loading={cancelling}
          loadingLabel="Cancelando"
          onClick={() => {
            setConfirming(false)
            void cancel()
          }}
        >
          Sí, cancelar
        </Button>
      </div>
    </fieldset>
  )
}
