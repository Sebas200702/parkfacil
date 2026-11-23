import { Button } from '@shared/ui/button'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Button', () => {
  it('ejecuta onClick al pulsarlo', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Reservar cupo</Button>)

    fireEvent.click(screen.getByRole('button', { name: 'Reservar cupo' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('no envía formularios salvo que se pida', () => {
    render(<Button>Reservar cupo</Button>)

    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('mientras carga cambia el rótulo, se marca ocupado e ignora las pulsaciones', () => {
    const onClick = vi.fn()
    render(
      <Button loading loadingLabel="Reservando" onClick={onClick}>
        Reservar cupo
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Reservando' })
    fireEvent.click(button)

    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(onClick).not.toHaveBeenCalled()
  })
})
