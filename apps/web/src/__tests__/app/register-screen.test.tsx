import { RegisterScreen } from '@app/register-screen'
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

describe('RegisterScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza campos accesibles de correo y contraseña', () => {
    const auth = createMockAuthContext()
    renderWithAuth(<RegisterScreen />, auth)

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeDefined()
    expect(screen.getByLabelText('Correo electrónico')).toBeDefined()
    expect(screen.getByLabelText('Contraseña')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDefined()
  })

  it('al registrarse exitosamente pasa al paso de confirmación con código de 6 dígitos', async () => {
    const onNavigate = vi.fn()
    const register = vi.fn().mockResolvedValueOnce({ userSub: 'sub-1' })
    const confirmCode = vi.fn().mockResolvedValueOnce(undefined)
    const auth = createMockAuthContext({ register, confirmCode })

    renderWithAuth(<RegisterScreen onNavigate={onNavigate} />, auth)

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'nuevo.usuario@parkfacil.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'PasswordSeguro123!' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('nuevo.usuario@parkfacil.com', 'PasswordSeguro123!')
      expect(screen.getByRole('heading', { name: 'Confirma tu correo' })).toBeDefined()
      expect(screen.getByLabelText('Código de 6 dígitos')).toBeDefined()
    })

    fireEvent.change(screen.getByLabelText('Código de 6 dígitos'), {
      target: { value: '112233' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Confirmar registro' }))

    await waitFor(() => {
      expect(confirmCode).toHaveBeenCalledWith('nuevo.usuario@parkfacil.com', '112233')
      expect(onNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('muestra mensaje traducido si el usuario ya existe (UsernameExistsException)', async () => {
    const err = new Error('User already exists')
    err.name = 'UsernameExistsException'
    const register = vi.fn().mockRejectedValueOnce(err)
    const auth = createMockAuthContext({ register })

    renderWithAuth(<RegisterScreen />, auth)

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ya.existe@parkfacil.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'Password123!' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(
        screen.getByText('Ya existe una cuenta registrada con este correo electrónico.'),
      ).toBeDefined()
    })
  })

  it('muestra mensaje traducido si la contraseña es inválida (InvalidPasswordException)', async () => {
    const err = new Error('Password does not conform to policy')
    err.name = 'InvalidPasswordException'
    const register = vi.fn().mockRejectedValueOnce(err)
    const auth = createMockAuthContext({ register })

    renderWithAuth(<RegisterScreen />, auth)

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'valido@parkfacil.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'corta' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Crear cuenta' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
      expect(
        screen.getByText(
          'La contraseña debe tener al menos 8 caracteres y contener números, mayúsculas y minúsculas.',
        ),
      ).toBeDefined()
    })
  })

  it('navega a /login al presionar el enlace de iniciar sesión', () => {
    const onNavigate = vi.fn()
    const auth = createMockAuthContext()
    renderWithAuth(<RegisterScreen onNavigate={onNavigate} />, auth)

    fireEvent.click(screen.getByRole('button', { name: 'Inicia sesión aquí' }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })
})

describe('RegisterScreen con Google', () => {
  it('muestra "Continuar con Google" en el registro', () => {
    renderWithAuth(<RegisterScreen />, createMockAuthContext())
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeDefined()
  })
})
