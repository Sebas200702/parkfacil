import { CupoMeter } from '@shared/ui/cupo-meter'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('CupoMeter', () => {
  it('dice la cifra exacta de cupos libres', () => {
    const { container } = render(<CupoMeter free={12} capacity={40} />)

    expect(container.textContent).toBe('12libres de 40')
  })

  it('avisa cuando el parqueadero está lleno', () => {
    const { container } = render(<CupoMeter free={0} capacity={25} />)

    expect(container.textContent).toBe('0libres de 25 · lleno')
  })
})
