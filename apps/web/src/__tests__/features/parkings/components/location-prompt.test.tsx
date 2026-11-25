import { LocationPrompt } from '@features/parkings/components/location-prompt'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('LocationPrompt', () => {
  it('invita a compartir la ubicación y avisa al pulsar', () => {
    const onLocate = vi.fn()
    render(<LocationPrompt status="idle" onLocate={onLocate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Usar mi ubicación' }))

    expect(screen.getByRole('heading', { name: '¿Cuál te queda más cerca?' })).toBeDefined()
    expect(onLocate).toHaveBeenCalledTimes(1)
  })

  it('mientras ubica lo dice en el botón', () => {
    render(<LocationPrompt status="locating" onLocate={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Ubicando' }).getAttribute('aria-busy')).toBe('true')
  })

  it('si el permiso fue negado explica qué hacer y deja reintentar', () => {
    render(<LocationPrompt status="denied" onLocate={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'No pudimos ubicarte' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeDefined()
  })

  it('desaparece cuando ya conocemos la ubicación', () => {
    const { container } = render(<LocationPrompt status="ready" onLocate={vi.fn()} />)

    expect(container.innerHTML).toBe('')
  })
})
