import { Notice } from '@shared/ui/notice'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Notice', () => {
  it('anuncia los errores como alerta', () => {
    render(
      <Notice tone="error" title="Sin cupos">
        Mira otro parqueadero cerca.
      </Notice>,
    )

    expect(screen.getByRole('alert').textContent).toContain('Sin cupos')
  })

  it('anuncia los demás tonos como estado', () => {
    render(<Notice tone="ok" title="Reserva cancelada" />)

    expect(screen.getByRole('status').textContent).toContain('Reserva cancelada')
  })
})
