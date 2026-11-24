import { AdminRoute } from '@components/AdminRoute'
import { AuthContext, type AuthContextValue } from '@context/AuthContext'
import { render, screen } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createMockAuthContext = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  idToken: null,
  isAuthenticated: false,
  isLoading: false,
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

const createMockJwt = (groups: string[] = ['admin'], expOffset = 3600): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(
    JSON.stringify({
      sub: 'admin-test',
      'cognito:groups': groups,
      exp: Math.floor(Date.now() / 1000) + expOffset,
    }),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${body}.sig`
}

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra estado de carga mientras isLoading sea true y no renderiza el contenido protegido', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext({ isLoading: true })

    renderWithAuth(
      <AdminRoute onNavigate={onNavigate}>
        <div>Contenido Privado</div>
      </AdminRoute>,
      auth,
    )

    expect(screen.getByText('Cargando panel administrativo...')).toBeDefined()
    expect(screen.queryByText('Contenido Privado')).toBeNull()
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('muestra acceso denegado y redirige a "/" si el usuario no está autenticado', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext({
      isLoading: false,
      isAuthenticated: false,
      idToken: null,
    })

    renderWithAuth(
      <AdminRoute onNavigate={onNavigate}>
        <div>Contenido Privado</div>
      </AdminRoute>,
      auth,
    )

    expect(screen.getByText('Acceso denegado')).toBeDefined()
    expect(screen.queryByText('Contenido Privado')).toBeNull()
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('muestra acceso denegado y redirige a "/" si el usuario está autenticado pero no pertenece al grupo admin', () => {
    const onNavigate = vi.fn()
    const nonAdminToken = createMockJwt(['conductor'])
    const auth = createMockAuthContext({
      isLoading: false,
      isAuthenticated: true,
      idToken: nonAdminToken,
    })

    renderWithAuth(
      <AdminRoute onNavigate={onNavigate}>
        <div>Contenido Privado</div>
      </AdminRoute>,
      auth,
    )

    expect(screen.getByText('Acceso denegado')).toBeDefined()
    expect(screen.queryByText('Contenido Privado')).toBeNull()
    expect(onNavigate).toHaveBeenCalledWith('/')
  })

  it('permite el acceso y renderiza los hijos cuando el usuario está autenticado con rol admin', () => {
    const onNavigate = vi.fn()
    const adminToken = createMockJwt(['admin'])
    const auth = createMockAuthContext({
      isLoading: false,
      isAuthenticated: true,
      idToken: adminToken,
    })

    renderWithAuth(
      <AdminRoute onNavigate={onNavigate}>
        <div>Contenido Administrativo Protegido</div>
      </AdminRoute>,
      auth,
    )

    expect(screen.getByText('Contenido Administrativo Protegido')).toBeDefined()
    expect(screen.queryByText('Acceso denegado')).toBeNull()
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
