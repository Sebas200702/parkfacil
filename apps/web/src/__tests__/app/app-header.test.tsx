import { AppHeader } from '@app/app-header'
import { AuthContext, type AuthContextValue } from '@context/AuthContext'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { describe, expect, it, vi } from 'vitest'

const createMockAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  idToken: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  confirmCode: vi.fn(),
  logout: vi.fn(),
  ...overrides,
})

const renderWithAuth = (ui: React.ReactElement, authValue: AuthContextValue) =>
  render(<AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>)

describe('AppHeader', () => {
  it('muestra botones de Iniciar sesión y Registrarse cuando no está autenticado', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext({ isAuthenticated: false })

    renderWithAuth(<AppHeader onNavigate={onNavigate} />, auth)

    const loginButton = screen.getByRole('button', { name: 'Iniciar sesión' })
    const registerButton = screen.getByRole('button', { name: 'Registrarse' })

    expect(loginButton).toBeDefined()
    expect(registerButton).toBeDefined()

    fireEvent.click(loginButton)
    expect(onNavigate).toHaveBeenCalledWith('/login')

    fireEvent.click(registerButton)
    expect(onNavigate).toHaveBeenCalledWith('/registro')
  })

  it('muestra botón de Cerrar sesión cuando el usuario está autenticado y ejecuta logout al hacer clic', () => {
    const logout = vi.fn()
    const auth = createMockAuthContext({ isAuthenticated: true, logout })

    renderWithAuth(<AppHeader />, auth)

    const logoutButton = screen.getByRole('button', { name: 'Cerrar sesión' })
    expect(logoutButton).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Iniciar sesión' })).toBeNull()

    fireEvent.click(logoutButton)
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('el logo de la marca navega al inicio "/"', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext()

    renderWithAuth(<AppHeader onNavigate={onNavigate} />, auth)

    const brandLink = screen.getByRole('link', { name: /ParkFácil/ })
    fireEvent.click(brandLink)

    expect(onNavigate).toHaveBeenCalledWith('/')
  })
})
