import { LoginScreen } from '@app/login-screen'
import { AuthContext, type AuthContextValue } from '@context/AuthContext'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza campos accesibles de correo y contraseña', () => {
    const auth = createMockAuthContext()
    renderWithAuth(<LoginScreen />, auth)

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeDefined()
    expect(screen.getByLabelText('Correo electrónico')).toBeDefined()
    expect(screen.getByLabelText('Contraseña')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeDefined()
  })

  it('envía credenciales y navega a la página principal al iniciar sesión con éxito', async () => {
    const onNavigate = vi.fn()
    const login = vi.fn().mockResolvedValueOnce(undefined)
    const auth = createMockAuthContext({ login })

    renderWithAuth(<LoginScreen onNavigate={onNavigate} />, auth)

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'conductor@parkfacil.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('conductor@parkfacil.com', 'Secret123!')
      expect(onNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('muestra mensaje traducido en español ante NotAuthorizedException', async () => {
    const err = new Error('Incorrect username or password.')
    err.name = 'NotAuthorizedException'
    const login = vi.fn().mockRejectedValueOnce(err)
    const auth = createMockAuthContext({ login })

    renderWithAuth(<LoginScreen />, auth)

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'conductor@parkfacil.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'ClaveErronea' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(
        screen.getByText('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.'),
      ).toBeDefined()
    })
  })

  it('permite ingresar código de confirmación si el usuario no ha sido confirmado (UserNotConfirmedException)', async () => {
    const err = new Error('User is not confirmed.')
    err.name = 'UserNotConfirmedException'
    const login = vi.fn().mockRejectedValueOnce(err)
    const confirmCode = vi.fn().mockResolvedValueOnce(undefined)
    const auth = createMockAuthContext({ login, confirmCode })

    renderWithAuth(<LoginScreen />, auth)

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'no.confirmado@parkfacil.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Secret123!' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Confirma tu cuenta' })).toBeDefined()
      expect(screen.getByLabelText('Código de verificación')).toBeDefined()
    })

    fireEvent.change(screen.getByLabelText('Código de verificación'), {
      target: { value: '654321' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Confirmar cuenta' }))

    await waitFor(() => {
      expect(confirmCode).toHaveBeenCalledWith('no.confirmado@parkfacil.com', '654321')
      expect(screen.getByText(/¡Cuenta confirmada con éxito!/)).toBeDefined()
    })
  })

  it('navega a /registro al presionar el enlace de registro', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext()
    renderWithAuth(<LoginScreen onNavigate={onNavigate} />, auth)

    fireEvent.click(screen.getByRole('button', { name: 'Regístrate aquí' }))
    expect(onNavigate).toHaveBeenCalledWith('/registro')
  })
})

describe('LoginScreen con Google', () => {
  it('muestra "Continuar con Google" y lo inicia al hacer clic', async () => {
    const loginWithGoogle = vi.fn().mockResolvedValueOnce(undefined)
    const auth = createMockAuthContext({ loginWithGoogle })
    renderWithAuth(<LoginScreen />, auth)

    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }))

    await waitFor(() => expect(loginWithGoogle).toHaveBeenCalledTimes(1))
  })

  it('muestra un error si Google no está disponible', async () => {
    const loginWithGoogle = vi.fn().mockRejectedValueOnce(new Error('GOOGLE_SIGNIN_NOT_CONFIGURED'))
    const auth = createMockAuthContext({ loginWithGoogle })
    renderWithAuth(<LoginScreen />, auth)

    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }))

    expect(await screen.findByText(/Google no está disponible/)).toBeDefined()
  })
})
