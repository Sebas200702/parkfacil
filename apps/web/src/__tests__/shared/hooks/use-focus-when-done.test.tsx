import { useFocusWhenDone } from '@shared/hooks/use-focus-when-done'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const Probe = ({ busy }: { busy: boolean }) => {
  const ref = useFocusWhenDone<HTMLDivElement>(busy)
  return (
    <div ref={ref} tabIndex={-1} data-testid="target">
      resultado
    </div>
  )
}

describe('useFocusWhenDone', () => {
  it('no roba el foco al montarse', () => {
    render(<Probe busy={false} />)

    expect(document.activeElement).toBe(document.body)
  })

  it('no mueve el foco mientras la acción sigue en curso', () => {
    const { rerender } = render(<Probe busy={false} />)

    rerender(<Probe busy />)

    expect(document.activeElement).toBe(document.body)
  })

  it('lleva el foco al elemento cuando la acción termina', () => {
    const { rerender } = render(<Probe busy />)

    rerender(<Probe busy={false} />)

    expect(document.activeElement).toBe(screen.getByTestId('target'))
  })
})
