import { RequireSession } from '@app/require-session'
import { type AuthContextValue, useAuth } from '@context/AuthContext'
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@context/AuthContext', () => ({ useAuth: vi.fn() }))

const useAuthMock = vi.mocked(useAuth)

const session = (overrides: Partial<AuthContextValue>) =>
  useAuthMock.mockReturnValue({
    isAuthenticated: false,
    isRestoring: false,
    ...overrides,
  } as AuthContextValue)

const renderProtected = () =>
  render(
    <RequireSession>
      <p>Mapa de parqueaderos</p>
    </RequireSession>,
  )

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_COGNITO_USER_POOL_ID', 'us-east-1_test')
})

afterEach(() => {
  vi.unstubAllEnvs()
  push.mockReset()
})

describe('RequireSession', () => {
  it('muestra el contenido a quien tiene sesión', () => {
    session({ isAuthenticated: true })

    renderProtected()

    expect(screen.getByText('Mapa de parqueaderos')).toBeDefined()
    expect(push).not.toHaveBeenCalled()
  })

  it('manda al inicio de sesión a quien no la tiene y no muestra el contenido', () => {
    session({ isAuthenticated: false })

    renderProtected()

    expect(push).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Mapa de parqueaderos')).toBeNull()
  })

  it('espera a que se recupere la sesión guardada antes de decidir', () => {
    session({ isAuthenticated: false, isRestoring: true })

    renderProtected()

    expect(push).not.toHaveBeenCalled()
    expect(screen.getByText('Comprobando tu sesión…')).toBeDefined()
  })

  it('sin Cognito configurado deja pasar, para trabajar en local con datos de demostración', () => {
    vi.stubEnv('NEXT_PUBLIC_COGNITO_USER_POOL_ID', '')
    session({ isAuthenticated: false })

    renderProtected()

    expect(screen.getByText('Mapa de parqueaderos')).toBeDefined()
    expect(push).not.toHaveBeenCalled()
  })
})
