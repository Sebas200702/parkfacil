import { Field, Input } from '@shared/ui/field'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Field', () => {
  it('enlaza la etiqueta con el control', () => {
    render(
      <Field label="Correo" htmlFor="email">
        <Input id="email" type="email" />
      </Field>,
    )

    expect(screen.getByLabelText('Correo').getAttribute('aria-invalid')).toBeNull()
  })

  it('enlaza el error con el control', () => {
    render(
      <Field label="Contraseña" htmlFor="password" error="Usa mínimo 8 caracteres.">
        <Input id="password" type="password" invalid />
      </Field>,
    )

    const input = screen.getByLabelText('Contraseña')

    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('password-error')
    expect(document.getElementById('password-error')?.textContent).toBe('Usa mínimo 8 caracteres.')
  })
})
