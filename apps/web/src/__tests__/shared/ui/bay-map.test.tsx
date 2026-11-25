import { BayMap, type BayMapItem } from '@shared/ui/bay-map'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const BAYS: BayMapItem[] = [
  { id: 'A-01', state: 'taken' },
  { id: 'A-02', state: 'free' },
  { id: 'A-03', state: 'held' },
  { id: 'M-01', state: 'taken', vehicle: 'moto' },
]

describe('BayMap', () => {
  it('rotula cada bahía con su identificador y estado en español', () => {
    render(<BayMap label="Plano" bays={BAYS} columns={2} />)

    expect(screen.getByRole('region', { name: 'Plano' })).toBeDefined()
    expect(screen.getByLabelText('A-01: Ocupado').getAttribute('data-state')).toBe('taken')
    expect(screen.getByLabelText('A-02: Libre').getAttribute('data-state')).toBe('free')
    expect(screen.getByLabelText('A-03: Reservado').getAttribute('data-state')).toBe('held')
  })

  it('dibuja un vehículo solo en bahías ocupadas', () => {
    render(<BayMap label="Plano" bays={BAYS} columns={2} />)

    expect(screen.getByLabelText('A-01: Ocupado').querySelector('svg')).not.toBeNull()
    expect(screen.getByLabelText('M-01: Ocupado').querySelector('svg')).not.toBeNull()
    expect(screen.getByLabelText('A-03: Reservado').querySelector('svg')).not.toBeNull()
    expect(screen.getByLabelText('A-02: Libre').querySelector('svg')).toBeNull()
  })

  it('reparte las bahías en filas de `columns` separadas por un carril', () => {
    const { container } = render(<BayMap label="Plano" bays={BAYS} columns={2} />)

    expect(container.querySelectorAll('ul')).toHaveLength(2)
    expect(container.querySelectorAll('hr')).toHaveLength(1)
  })

  it('en modo resumen no muestra códigos y se anuncia solo por su nombre', () => {
    const { container } = render(<BayMap label="Dibujo" bays={BAYS} columns={2} summary />)

    expect(screen.getByRole('region', { name: 'Dibujo' })).toBeDefined()
    expect(screen.queryByText('A-01')).toBeNull()
    expect(container.querySelector('[aria-hidden="true"] ul')).not.toBeNull()
    expect(container.querySelectorAll('[data-state="taken"] svg')).toHaveLength(2)
  })

  it('en modo compacto dibuja bahías más bajas', () => {
    const { container } = render(<BayMap label="Dibujo" bays={BAYS} columns={2} compact />)

    expect(container.querySelector('li > span[aria-hidden="true"]')?.className).toContain('h-16')
  })
})
