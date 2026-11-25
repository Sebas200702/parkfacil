import { AppHeader } from '@app/app-header'
import { AuthContext, type AuthContextValue } from '@context/AuthContext'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { describe, expect, it, vi } from 'vitest'

const createMockJwt = (groups: string[] = ['admin']): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(
    JSON.stringify({
      sub: 'admin-header-test',
      'cognito:groups': groups,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${body}.sig`
}

const createMockAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  idToken: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoring: false,
  login: vi.fn(),
  register: vi.fn(),
  confirmCode: vi.fn(),
  loginWithGoogle: vi.fn(),
  oauthError: null,
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

  it('con sesión lleva a Mis reservas', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext({ isAuthenticated: true })

    renderWithAuth(<AppHeader onNavigate={onNavigate} />, auth)
    fireEvent.click(screen.getByRole('button', { name: 'Mis reservas' }))

    expect(onNavigate).toHaveBeenCalledWith('/reservas')
  })

  it('sin sesión no ofrece Mis reservas', () => {
    renderWithAuth(<AppHeader />, createMockAuthContext({ isAuthenticated: false }))

    expect(screen.queryByRole('button', { name: 'Mis reservas' })).toBeNull()
  })

  it('el logo de la marca navega al inicio "/"', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext()

    renderWithAuth(<AppHeader onNavigate={onNavigate} />, auth)

    const brandLink = screen.getByRole('link', { name: /ParkFácil/ })
    fireEvent.click(brandLink)

    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('con sesión, el logo lleva directo al mapa sin pasar por la landing', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext({ isAuthenticated: true })

    renderWithAuth(<AppHeader onNavigate={onNavigate} />, auth)

    const brandLink = screen.getByRole('link', { name: /ParkFácil/ })
    expect(brandLink.getAttribute('href')).toBe('/mapa')
    fireEvent.click(brandLink)

    expect(onNavigate).toHaveBeenCalledWith('/mapa')
  })

  it('muestra el enlace a Administración únicamente si el usuario pertenece al grupo admin', () => {
    const onNavigate = vi.fn()
    const adminToken = createMockJwt(['admin'])
    const auth = createMockAuthContext({
      isAuthenticated: true,
      idToken: adminToken,
    })

    renderWithAuth(<AppHeader onNavigate={onNavigate} />, auth)

    const adminButton = screen.getByRole('button', { name: 'Administración' })
    expect(adminButton).toBeDefined()

    fireEvent.click(adminButton)
    expect(onNavigate).toHaveBeenCalledWith('/admin')
  })

  it('no muestra el enlace a Administración si el usuario no tiene rol admin', () => {
    const nonAdminToken = createMockJwt(['conductor'])
    const auth = createMockAuthContext({
      isAuthenticated: true,
      idToken: nonAdminToken,
    })

    renderWithAuth(<AppHeader />, auth)

    expect(screen.queryByRole('button', { name: 'Administración' })).toBeNull()
  })
})
