import { Segmented } from '@shared/ui/segmented'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

describe('Segmented', () => {
  it('marca la opción activa y avisa el cambio', () => {
    const onChange = vi.fn()
    render(
      <Segmented
        label="Tipo de vehículo"
        options={[
          { value: 'CARRO', label: 'Carro' },
          { value: 'MOTO', label: 'Moto' },
        ]}
        value="CARRO"
        onChange={onChange}
      />,
    )

    expect(screen.getByRole('button', { name: 'Carro' }).getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Moto' }))

    expect(onChange).toHaveBeenCalledWith('MOTO')
  })
})
