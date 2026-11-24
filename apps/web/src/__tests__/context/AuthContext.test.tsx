import { AuthProvider, useAuth } from '@context/AuthContext'
import { act, renderHook, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetCurrentIdToken,
  mockSignIn,
  mockSignUp,
  mockConfirmSignUp,
  mockSignOut,
  mockCompleteOAuthSignIn,
  mockStartGoogleSignIn,
} = vi.hoisted(() => ({
  mockCompleteOAuthSignIn: vi.fn(),
  mockStartGoogleSignIn: vi.fn(),
  mockGetCurrentIdToken: vi.fn(),
  mockSignIn: vi.fn(),
  mockSignUp: vi.fn(),
  mockConfirmSignUp: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('@lib/cognito', () => ({
  getCurrentIdToken: mockGetCurrentIdToken,
  signIn: mockSignIn,
  signUp: mockSignUp,
  confirmSignUp: mockConfirmSignUp,
  signOut: mockSignOut,
  completeOAuthSignIn: mockCompleteOAuthSignIn,
  startGoogleSignIn: mockStartGoogleSignIn,
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentIdToken.mockResolvedValue(null)
    mockCompleteOAuthSignIn.mockResolvedValue(null)
  })

  it('usa el token de Google al volver del Hosted UI de Cognito', async () => {
    mockCompleteOAuthSignIn.mockResolvedValueOnce('id-token-google')

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.idToken).toBe('id-token-google')
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('loginWithGoogle inicia la redirección a Google', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.loginWithGoogle()
    })

    expect(mockStartGoogleSignIn).toHaveBeenCalledTimes(1)
  })

  it('restaura la sesión activa al montar el provider sin bloquear la carga', async () => {
    mockGetCurrentIdToken.mockResolvedValueOnce('id-token-activo-123')

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.idToken).toBe('id-token-activo-123')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(mockGetCurrentIdToken).toHaveBeenCalledTimes(1)
  })

  it('establece isAuthenticated en false si no hay sesión inicial', async () => {
    mockGetCurrentIdToken.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.idToken).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('login llama a signIn y actualiza el idToken y estado de autenticación', async () => {
    mockSignIn.mockResolvedValueOnce({
      idToken: 'token-nuevo-login',
      getIdToken: () => ({ getJwtToken: () => 'token-nuevo-login' }),
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('usuario@parkfacil.com', 'Clave123!')
    })

    expect(mockSignIn).toHaveBeenCalledWith('usuario@parkfacil.com', 'Clave123!')
    expect(result.current.idToken).toBe('token-nuevo-login')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('register llama a signUp con los parámetros correspondientes', async () => {
    mockSignUp.mockResolvedValueOnce({ userSub: 'sub-xyz' })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.register('nuevo@parkfacil.com', 'Pass456!')
    })

    expect(mockSignUp).toHaveBeenCalledWith('nuevo@parkfacil.com', 'Pass456!', undefined)
    expect(result.current.isLoading).toBe(false)
  })

  it('confirmCode llama a confirmSignUp con el correo y código de 6 dígitos', async () => {
    mockConfirmSignUp.mockResolvedValueOnce('SUCCESS')

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.confirmCode('usuario@parkfacil.com', '123456')
    })

    expect(mockConfirmSignUp).toHaveBeenCalledWith('usuario@parkfacil.com', '123456')
    expect(result.current.isLoading).toBe(false)
  })

  it('logout llama a signOut y restablece el estado a no autenticado', async () => {
    mockGetCurrentIdToken.mockResolvedValueOnce('token-a-cerrar')

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    act(() => {
      result.current.logout()
    })

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(result.current.idToken).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('useAuth lanza error si se invoca fuera del AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe ser usado dentro de un AuthProvider',
    )
  })
})
