import { BayStatus } from '@shared/ui/bay-status'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('BayStatus', () => {
  it('muestra el rótulo en español de cada estado', () => {
    render(
      <>
        <BayStatus state="free" />
        <BayStatus state="held" />
        <BayStatus state="taken" />
      </>,
    )

    expect(screen.getByText('Libre')).toBeDefined()
    expect(screen.getByText('Reservado')).toBeDefined()
    expect(screen.getByText('Ocupado')).toBeDefined()
  })

  it('acepta un rótulo propio', () => {
    render(<BayStatus state="held">Reservado hasta las 3:47 p. m.</BayStatus>)

    expect(screen.getByText('Reservado hasta las 3:47 p. m.')).toBeDefined()
  })
})
