import { ButtonLink } from '@shared/ui/button-link'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('ButtonLink', () => {
  it('es un enlace que navega en la misma pestaña', () => {
    render(<ButtonLink href="/admin">Administración</ButtonLink>)

    const link = screen.getByRole('link', { name: 'Administración' })

    expect(link.getAttribute('href')).toBe('/admin')
    expect(link.getAttribute('target')).toBeNull()
  })

  it('un destino externo abre en otra pestaña sin exponer la página de origen', () => {
    render(
      <ButtonLink href="https://example.test/ruta" external>
        Cómo llegar
      </ButtonLink>,
    )

    const link = screen.getByRole('link', { name: 'Cómo llegar' })

    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
