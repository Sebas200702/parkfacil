import { LotPlan } from '@features/parkings/components/lot-plan'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('LotPlan', () => {
  it('dibuja un vehículo por cada bahía ocupada y deja vacías las libres', () => {
    const { container } = render(<LotPlan free={5} capacity={12} vehicle="CARRO" />)

    expect(container.querySelectorAll('[data-state="taken"] svg')).toHaveLength(7)
    expect(container.querySelectorAll('[data-state="free"] svg')).toHaveLength(0)
  })

  it('dice la cifra exacta en texto y en el nombre accesible del dibujo', () => {
    const { container } = render(<LotPlan free={5} capacity={12} vehicle="CARRO" />)

    expect(container.textContent).toContain('5libres de 12')
    expect(
      screen.getByRole('region', {
        name: 'Dibujo del parqueadero: 5 libres de 12 para carros',
      }),
    ).toBeDefined()
  })

  it('aclara que el dibujo no muestra la posición real de cada cupo', () => {
    render(<LotPlan free={1} capacity={4} vehicle="MOTO" />)

    expect(screen.getByText('no muestra la posición real', { exact: false })).toBeDefined()
  })
})
