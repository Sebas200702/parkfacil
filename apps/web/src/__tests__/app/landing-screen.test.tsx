import { LandingScreen } from '@app/landing-screen'
import { type AuthContextValue, useAuth } from '@context/AuthContext'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@context/AuthContext', () => ({ useAuth: vi.fn() }))

const useAuthMock = vi.mocked(useAuth)

const renderLanding = (isAuthenticated: boolean) => {
  useAuthMock.mockReturnValue({ isAuthenticated } as AuthContextValue)
  return render(<LandingScreen />)
}

const hrefs = (name: string) =>
  screen.getAllByRole('link', { name }).map((link) => link.getAttribute('href'))

afterEach(() => {
  push.mockReset()
  window.history.replaceState({}, '', '/')
})

describe('LandingScreen', () => {
  it('abre con el titular del servicio', () => {
    renderLanding(false)

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Llega conel cupoapartado')
  })

  it('explica el servicio en tres pasos ordenados', () => {
    renderLanding(false)

    const list = document.querySelector('#pasos ol') as HTMLElement
    const steps = within(list).getAllByRole('heading')

    expect(steps.map((step) => step.textContent)).toEqual([
      'Mira dónde hay cupo',
      'Aparta el tuyo',
      'Llega en 15 minutos',
    ])
  })

  it('muestra un plano de ejemplo con carros y motos', () => {
    renderLanding(false)

    const plan = screen.getByRole('region', { name: /Plano de ejemplo/ })

    expect(plan.querySelectorAll('[data-state="taken"]')).toHaveLength(7)
    expect(plan.querySelectorAll('[data-state="free"]')).toHaveLength(5)
  })

  it('en pantallas pequeñas el menú de secciones se despliega con un botón', () => {
    renderLanding(false)

    const toggle = screen.getByRole('button', { name: 'Menú' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(toggle)

    expect(screen.getByRole('button', { name: 'Cerrar' }).getAttribute('aria-expanded')).toBe(
      'true',
    )
    expect(screen.getByRole('link', { name: '/ El plano' }).getAttribute('href')).toBe('#plano')
  })

  it('el menú se cierra al elegir una sección', () => {
    renderLanding(false)
    fireEvent.click(screen.getByRole('button', { name: 'Menú' }))

    fireEvent.click(screen.getByRole('link', { name: '/ Cómo funciona' }))

    expect(screen.getByRole('button', { name: 'Menú' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('lleva al inicio de sesión y al registro', () => {
    renderLanding(false)

    expect(hrefs('Iniciar sesión').every((href) => href?.startsWith('/login'))).toBe(true)
    expect(hrefs('Crear cuenta').every((href) => href?.startsWith('/registro'))).toBe(true)
  })

  it('no manda a ningún lado a quien no tiene sesión', () => {
    renderLanding(false)

    expect(push).not.toHaveBeenCalled()
  })

  it('deja ver la landing a quien ya tiene sesión', () => {
    renderLanding(true)

    expect(push).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('manda al mapa a quien vuelve de iniciar sesión con Google', () => {
    window.history.replaceState({}, '', '/?code=abc&state=xyz')

    renderLanding(true)

    expect(push).toHaveBeenCalledWith('/mapa')
  })
})
