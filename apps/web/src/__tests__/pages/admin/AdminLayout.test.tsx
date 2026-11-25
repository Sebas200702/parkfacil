import { AuthContext, type AuthContextValue } from '@context/AuthContext'
import { AdminLayout } from '@pages/admin/AdminLayout'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createMockJwt = (parqueaderoId = 'parq-norte-01'): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(
    JSON.stringify({
      sub: 'admin-test',
      'cognito:groups': ['admin'],
      'custom:parqueaderoId': parqueaderoId,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${body}.sig`
}

const createMockAuthContext = (token: string): AuthContextValue => ({
  idToken: token,
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  confirmCode: vi.fn(),
  loginWithGoogle: vi.fn(),
  oauthError: null,
  logout: vi.fn(),
})

const renderWithAuth = (ui: React.ReactElement, authValue: AuthContextValue) =>
  render(<AuthContext.Provider value={authValue}>{ui}</AuthContext.Provider>)

vi.mock('@lib/api', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: [], status: 200, error: null }) },
}))

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el encabezado con el custom:parqueaderoId del token', () => {
    const auth = createMockAuthContext(createMockJwt('parq-centro-99'))
    renderWithAuth(<AdminLayout currentRoute="/admin/espacios" />, auth)

    expect(screen.getByRole('heading', { name: 'Panel Administrativo' })).toBeDefined()
    expect(screen.getByText('parq-centro-99')).toBeDefined()
  })

  it('redirige por defecto de /admin hacia /admin/espacios', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext(createMockJwt())

    renderWithAuth(<AdminLayout currentRoute="/admin" onNavigate={onNavigate} />, auth)

    expect(onNavigate).toHaveBeenCalledWith('/admin/espacios')
  })

  it('renderiza la sección de espacios en vivo por defecto o en /admin/espacios', () => {
    const auth = createMockAuthContext(createMockJwt())
    renderWithAuth(<AdminLayout currentRoute="/admin/espacios" />, auth)

    expect(screen.getByTestId('admin-section-espacios')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Espacios en vivo' })).toBeDefined()
  })

  it('renderiza la sección de tarifas cuando la ruta es /admin/tarifas', () => {
    const auth = createMockAuthContext(createMockJwt())
    renderWithAuth(<AdminLayout currentRoute="/admin/tarifas" />, auth)

    expect(screen.getByTestId('admin-section-tarifas')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Tarifas del parqueadero' })).toBeDefined()
  })

  it('renderiza la sección de métricas cuando la ruta es /admin/metricas', () => {
    const auth = createMockAuthContext(createMockJwt())
    renderWithAuth(<AdminLayout currentRoute="/admin/metricas" />, auth)

    expect(screen.getByTestId('admin-section-metricas')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Métricas operativas' })).toBeDefined()
  })

  it('permite navegar entre secciones usando el control segmentado', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext(createMockJwt())

    renderWithAuth(<AdminLayout currentRoute="/admin/espacios" onNavigate={onNavigate} />, auth)

    const tarifasButton = screen.getByRole('button', { name: 'Tarifas' })
    fireEvent.click(tarifasButton)

    expect(onNavigate).toHaveBeenCalledWith('/admin/tarifas')

    const metricasButton = screen.getByRole('button', { name: 'Métricas' })
    fireEvent.click(metricasButton)

    expect(onNavigate).toHaveBeenCalledWith('/admin/metricas')
  })
})
