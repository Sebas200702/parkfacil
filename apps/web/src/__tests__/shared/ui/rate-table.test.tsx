import { RateTable } from '@shared/ui/rate-table'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const RATE = { valorHora: 4000, valorFraccion: 1000, valorDia: 30000 }

describe('RateTable', () => {
  it('muestra los tres conceptos con su valor en pesos', () => {
    render(<RateTable rate={RATE} />)

    const terms = screen.getAllByRole('term').map((term) => term.textContent)
    const values = screen.getAllByRole('definition').map((value) => value.textContent)

    expect(terms).toEqual(['Hora', 'Fracción de 15 min', 'Tope por día'])
    expect(values).toEqual(['$4.000', '$1.000', '$30.000'])
  })
})
