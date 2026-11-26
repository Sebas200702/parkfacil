import { usePageTitle } from '@shared/hooks/use-page-title'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('usePageTitle', () => {
  it('pone el nombre de la pantalla antes del de la app', () => {
    renderHook(() => usePageTitle('Mis reservas'))

    expect(document.title).toBe('Mis reservas · ParkFácil')
  })

  it('cambia cuando cambia la pantalla', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'Parqueaderos' },
    })

    rerender({ title: 'Parque 93' })

    expect(document.title).toBe('Parque 93 · ParkFácil')
  })

  it('sin nombre deja solo el de la app', () => {
    renderHook(() => usePageTitle(null))

    expect(document.title).toBe('ParkFácil')
  })
})
